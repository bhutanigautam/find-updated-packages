const childProcess = require("@lerna/child-process");
const fs = require('fs');
var contents = fs.readFileSync('lerna.json', 'utf8');
var lernaJSON = JSON.parse(contents);

const projectPackageList=[];


lernaJSON.packages.forEach((package) => {
  const packagePath = package;
  const packageJSONPath = `${packagePath}/package.json`;

  var packagePackage = fs.readFileSync(packageJSONPath, 'utf8');
  var packagePackageJson = JSON.parse(packagePackage);

  const packageName = packagePackageJson.name;
  const packageDeployable = packagePackageJson.deployable || false;
  const packagePrivate = packagePackageJson.private || false;
  const packageVersion = packagePackageJson.version;
  const packageDependencies = packagePackageJson.dependencies;

  projectPackageList.push({
    name: packageName,
    path: packagePath,
    deployable: packageDeployable,
    private: packagePrivate,
    version: packageVersion,
    dependencies: packageDependencies
  })
});

// Get last tag
var lastTag = childProcess.execSync("git", ["describe", "--abbrev=0"]);
// Get changes since last tag
var changedFiles = childProcess.execSync("git", ["diff", "--name-only", lastTag]).split("\n");

// Create a list of updated packages
var updatedPackages = [];

changedFiles.forEach(file => {
  projectPackageList.forEach((package) => {
    if (file.startsWith(`${package.path}/`)) {
      updatedPackages.push(package);
    }
  })
})

const changedPackages = [];
const publishReadyPackages = [];
const deployReadyPackages = [];

console.log('The following packages were updated -');
updatedPackages.forEach(package => {
  console.log(package.name);
  changedPackages.push(package.name);
  if (package.deployable) {
    deployReadyPackages.push(package.name);
    return;
  }
  if (!package.private) {
    publishReadyPackages.push(package.name);
  }
});

console.log('The following packages need to be published -');
publishReadyPackages.forEach(package => {
  console.log(package);
});


console.log('The following packages need to be deployed -');
deployReadyPackages.forEach(package => {
  console.log(package);
});