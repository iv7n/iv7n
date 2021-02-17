const args = require('minimist')(process.argv.slice(2))
const fs = require('fs')
const path = require('path')
const chalk = require('chalk')
const execa = require('execa')

const skipTests = args.skipTests
const skipBuild = args.skipBuild
const fromPackage = args.fromPackage
const fromGit = args.fromGit
const prerelease = args.prerelease

const bin = name => path.resolve(__dirname, '../node_modules/.bin/' + name)
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
    console.log('(skipped)')
  }

  // build all packages with types
  step('\nBuilding all packages...')
  if (!skipBuild) {
    await run('yarn', ['build', '--release'])
    // // test generated dts files
    // step('\nVerifying type declarations...')
    // await run('yarn', ['test-dts-only'])
  } else {
    console.log('(skipped)')
  }

  // publish packages
  step('\nPublishing packages...')
  await run(
    'lerna',
    [
      'publish',
      prerelease ? '--canary' : '',
      '--no-push',
      fromPackage ? '--from-package' : '',
      fromGit ? '--from-git' : '',
    ].filter(Boolean)
  )

  // update all package versions and inter-dependencies
  step('\nUpdating all package versions...')
  const version = await updateVersions()

  // generate changelog
  await run('yarn', ['changelog'])

  step('\nCommitting changes...')
  await run('git', ['add', '-A'])
  await run('git', ['commit', '-m', `chore(release): v${version}`])

  step(`v${version} is released 🎉`)
}

async function updateVersions() {
  // // update all package versions
  // await run(`lerna`, ['version', '--no-git-tag-version'])

  // update self package version
  // get latest version
  const pkg = JSON.parse(
    fs.readFileSync(path.resolve(__dirname, '../', 'lerna.json'), 'utf-8')
  )
  const { version } = pkg

  const selfPkgPath = path.resolve(__dirname, '../', 'package.json')
  const selfPkg = JSON.parse(fs.readFileSync(selfPkgPath, 'utf-8'))
  selfPkg.version = version
  fs.writeFileSync(selfPkgPath, JSON.stringify(selfPkg, null, 2) + '\n')

  return version
}

main().catch(err => {
  console.error(err)
})
