import babel from '@rollup/plugin-babel'
import ts from 'rollup-plugin-typescript2'
import path from 'path'
import json from '@rollup/plugin-json'

if (!process.env.TARGET) {
  throw new Error('TARGET package must be specified via --environment flag.')
}

const packagesDir = path.resolve(__dirname, 'packages')
const packageDir = path.resolve(packagesDir, process.env.TARGET)
const name = path.basename(packageDir)
const resolve = p => path.resolve(packageDir, p)
const pkg = require(resolve(`package.json`))
const packageOptions = pkg.buildOptions || {}

// ensure TS checks only once for each build
let hasTSChecked = false

// const OUTPUT_PATH = path.resolve(__dirname, 'dist')
const extensions = ['.ts', '.js', '.tsx']

const outputConfigs = {
  'esm-bundler': {
    file: resolve(`dist/${name}.esm-bundler.js`),
    format: `es`,
  },
  'esm-browser': {
    file: resolve(`dist/${name}.esm-browser.js`),
    format: `es`,
  },
  cjs: {
    file: resolve(`dist/${name}.cjs.js`),
    format: `cjs`,
  },
}

const defaultFormats = ['esm-bundler', 'cjs']
const inlineFormats = process.env.FORMATS && process.env.FORMATS.split(',')
const packageFormats = inlineFormats || packageOptions.formats || defaultFormats
const packageConfigs = process.env.PROD_ONLY
  ? []
  : packageFormats.map(format => createConfig(format, outputConfigs[format]))

function createConfig(format, output, plugins = []) {
  if (!output) {
    console.log(require('chalk').yellow(`invalid format: "${format}"`))
    process.exit(1)
  }

  output.sourcemap = !!process.env.SOURCE_MAP
  output.externalLiveBindings = false

  const shouldEmitDeclarations = process.env.TYPES != null && !hasTSChecked

  const tsPlugin = ts({
    check: process.env.NODE_ENV === 'production' && !hasTSChecked,
    tsconfig: path.resolve(__dirname, 'tsconfig.json'),
    cacheRoot: path.resolve(__dirname, 'node_modules/.rts2_cache'),
    tsconfigOverride: {
      compilerOptions: {
        sourceMap: output.sourcemap,
        declaration: shouldEmitDeclarations,
        declarationMap: shouldEmitDeclarations,
      },
    },
  })
  // we only need to check TS and generate declarations once for each build.
  // it also seems to run into weird issues when checking multiple times
  // during a single build.
  hasTSChecked = true

  const entryFile = 'src/index.ts'
  const external = [...Object.keys(pkg.peerDependencies || {})]

  // const nodePlugins =
  //   format !== 'cjs'
  //     ? [
  //         require('@rollup/plugin-node-resolve').nodeResolve({
  //           preferBuiltins: true,
  //         }),
  //         require('@rollup/plugin-commonjs')({
  //           sourceMap: false,
  //         }),
  //         require('rollup-plugin-node-builtins')(),
  //         require('rollup-plugin-node-globals')(),
  //       ]
  //     : []

  return {
    input: resolve(entryFile),
    external,
    plugins: [
      json({
        namedExports: false,
      }),
      tsPlugin,
      babel({
        extensions,
        babelHelpers: 'bundled',
        exclude: '**/node_modules/**', // only transpile our source code
      }),
      // ...nodePlugins,
      ...plugins,
    ],
    output,
    onwarn: (msg, warn) => {
      if (!/Circular/.test(msg)) {
        warn(msg)
      }
    },
    // treeshake: {
    //   moduleSideEffects: false,
    // },
  }
}

export default packageConfigs
