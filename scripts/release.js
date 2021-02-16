const args = require('minimist')(process.argv.slice(2))
const fs = require('fs')
const path = require('path')
const chalk = require('chalk')
const execa = require('execa')

const skipTests = args.skipTests
const skipBuild = args.skipBuild

const run = (bin, args, opts = {}) =>
  execa(bin, args, { stdio: 'inherit', ...opts })
const step = msg => console.log(chalk.cyan(msg))

async function main() {
  // run tests before release
  step('\nRunning tests...')
  if (!skipTests) {
    await run(bin('jest'), ['--clearCache'])
    await run('yarn', ['test'])
  } else {
    console.log(`(skipped)`)
  }

  // build all packages with types
  step('\nBuilding all packages...')
  if (!skipBuild) {
    await run('yarn', ['build', '--release'])
    // // test generated dts files
    // step('\nVerifying type declarations...')
    // await run('yarn', ['test-dts-only'])
  } else {
    console.log(`(skipped)`)
  }

  // update all package versions and inter-dependencies
  step('\nUpdating all package versions...')
  await updateVersions()

  // generate changelog
  await run(`yarn`, ['changelog'])
}

async function updateVersions() {
  // update all package versions
  await run(`lerna`, ['version', '--no-git-tag-version'])

  // update self package version
  // get latest version
  const pkg = fs.readFileSync(
    path.resolve(__dirname, '../packages', 'lerna.json'),
    'utf-8'
  )
  const { version } = pkg

  const selfPkgPath = path.resolve(__dirname, '../', 'package.json')
  const selfPkg = fs.readFileSync(selfPkgPath, 'utf-8')
  selfPkg.version = version
  fs.writeFileSync(selfPkgPath, JSON.stringify(selfPkg, null, 2) + '\n')
}

main().catch(err => {
  console.error(err)
})
