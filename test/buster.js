var config = module.exports;

config["lilmodel node tests"] = {
  rootPath: "../",
  environment: "node",
  tests: [
    "test/*-test.js"
  ]
};

config["lilmodel browser tests"] = {
  rootPath: "../",
  environment: "browser",
  sources: [
    "node_modules/es5-shim/es5-shim.js",
    "dist/lilmodel.js"
  ],
  tests: [
    "test/*-test.js"
  ]
};