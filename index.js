const core = require('@actions/core');
const exec = require('@actions/exec')
const os = require('os')

async function main() {
  try {
    // Get the variables we care about
    const channel = core.getInput('channel') || 'stable';
    const project = core.getInput('project') || 'chef-workstation';
    const version = core.getInput('version');
    const chefDownloadUrl = core.getInput('chefDownloadUrl') || 'chefdownload-community.chef.io';

    const license = core.getInput('license');
    const licenseParam = license ? `?license_id=${license}` : '';

    // This tool has intimate knowledge of the os
    // as Windows and Linux/MacOS run different installers
    // so we will check what OS and run appropriately
    // Create the args that the bash script will need
    if (os.platform() != 'win32')
    {
      var channelParam = `-c ${channel}`
      var projectParam = `-P ${project}`
      if (version) {
        versionParam = `-v ${version}`
      }
      else {
        versionParam = ''
      }
      await exec.exec(`curl -L https://${chefDownloadUrl}/install.sh${licenseParam} -o chefDownload.sh`)
      await exec.exec(`sudo chmod +x chefDownload.sh`)
      await exec.exec(`sudo ./chefDownload.sh ${channelParam} ${projectParam} ${versionParam}`)
      await exec.exec(`rm -f chefDownload.sh`)
    }
    // We are on windows so assume powershell
    else
    {
      const windowsPath = core.getInput('windowsPath');
      var channelParam = `-channel ${channel}`
      var projectParam = `-project ${project}`
      if (version) {
        versionParam = `-version ${version}`
      }
      else {
        versionParam = ''
      }
      await exec.exec(`powershell.exe -command ". { iwr -useb https://${chefDownloadUrl}/install.ps1${licenseParam} } | iex; install ${channelParam} ${projectParam} ${versionParam}"`)
      core.addPath(`${windowsPath}\\bin`)
    }

  } catch (error){
    core.setFailed(error.message);
  }
}
main()
