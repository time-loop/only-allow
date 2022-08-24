#!/usr/bin/env node
const whichPMRuns = require('which-pm-runs')
const boxen = require('boxen')
const path = require('path')
const fs = require('fs')
const semver = require('semver')

const cwd = process.env.INIT_CWD || process.cwd()
const isInstalledAsDependency = cwd.includes('node_modules')

if (!isInstalledAsDependency) {
  const {pm: wantedPM, version: wantedVersion} = getWantedPm();

  if (wantedPM !== 'npm' && wantedPM !== 'cnpm' && wantedPM !== 'pnpm' && wantedPM !== 'yarn') {
    console.log(`"${wantedPM}" is not a valid package manager. Available package managers are: npm, cnpm, pnpm, or yarn.`)
    process.exit(1)
  }

  const usedPM = whichPMRuns()
  if (usedPM && usedPM.name !== wantedPM) {
    const boxenOpts = { borderColor: 'red', borderStyle: 'double', padding: 1 }

    switch (wantedPM) {
      case 'npm':
        console.log(boxen('Use "npm install" for installation in this project', boxenOpts))
        break
      case 'cnpm':
        console.log(boxen('Use "cnpm install" for installation in this project', boxenOpts))
        break
      case 'pnpm':
        console.log(boxen(`Use "pnpm install" for installation in this project.

If you don't have pnpm, install it via "${getInstallCommand(`npm i -g pnpm${wantedVersion ? '@' + wantedVersion : ''}`)}".
For more details, go to https://pnpm.js.org/`, boxenOpts))
        break
      case 'yarn':
        console.log(boxen(`Use "yarn" for installation in this project.

If you don't have Yarn, install it via "${getInstallCommand('npm i -g yarn')}".
For more details, go to https://yarnpkg.com/`, boxenOpts))
        break
    }
    process.exit(1)
  } else if (wantedVersion && usedPM && !semver.satisfies(usedPM.version, wantedVersion)) {

    switch (wantedPM) {
      case 'pnpm':
        console.log(boxen(`Wrong version of pnpm installed, expected ${wantedVersion} but got ${usedPM.version}.
        
Fix it by running "${getInstallCommand(`npm i -g pnpm@${wantedVersion}`)}".`, boxenOpts))
        break

      default:
        console.log(boxen(`Wrong version of ${wantedPM} installed, expected ${wantedVersion} but got ${usedPM.version}.`, boxenOpts))
        break;
    }

    process.exit(1)
  }

}

function getWantedPm() {

  const packageJsonPath = path.join(process.cwd(), 'package.json');

  if (fs.existsSync(packageJsonPath)) {
    const packageJson = require(packageJsonPath);

    if (packageJson.packageManager) {
      const [pm, version] = packageJson.packageManager.split('@');
      return {
        pm,
        version
      }
    }
  }

  const argv = process.argv.slice(2)
  if (argv.length === 0) {
    console.log('Please specify the wanted package manager: only-allow <npm|cnpm|pnpm|yarn>')
    process.exit(1)
  }

  return {
    pm: argv[0],
    version: argv[1]
  }
}

function getNodeMajor() {
  return +process.versions.node.split('.')[0]
}

function getInstallCommand(corepackNotEnabled) {
  const nodeMajor = getNodeMajor();
  if (nodeMajor >= 14) {
    return `corepack enable`
  }
  return corepackNotEnabled
}
