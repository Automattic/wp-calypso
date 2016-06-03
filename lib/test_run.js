//
// Provide Mocha support for:
//   - Rowdy adapter ( https://github.com/FormidableLabs/rowdy )
//   - Ad-hoc selenium integration (i.e. do-it-yourself and wire up via args/environment provided by magellan)
//   - Non-browser testing, or regular node.js mocha tests
//

var _ = require("lodash");
var mochaSettings = require("./settings");

var RowdyMochaTestRun = function (options) {
  _.extend(this, options);

  // Ensure we have this object no matter what
  this.sauceBrowserSettings = _.extend({}, this.sauceBrowserSettings);

  // Remove things Appium doesn't care about and seems to choke on but
  // are part of magellan's browser settings serialization for the moment.
  delete this.sauceBrowserSettings.resolutions;
  delete this.sauceBrowserSettings.id;

  // Convert browser naming convention for Rowdy, which supports browsers
  // sourced from sauce, local desktop, browserstack, etc.
  if (options.sauceBrowserSettings) {
    this.rowdyBrowser = "sauceLabs." + options.sauceBrowserSettings.id;
  } else {
    this.rowdyBrowser = "local." + this.environmentId;
  }

  // Copy tunnelId into sauce settings since this is not done for us
  if (options.sauceSettings && options.sauceSettings.useTunnels) {
    this.tunnelId = options.tunnelId;
  }
};

// return the command line path to the test framework binary
RowdyMochaTestRun.prototype.getCommand = function () {
  return "./node_modules/.bin/mocha";
};

// return the environment
RowdyMochaTestRun.prototype.getEnvironment = function (env) {
  //
  // Environment / Arguments Wiring Notes:
  //
  // We've got several ways to tell a mocha client where to find its mocking port:
  //
  //   1) NODE_CONFIG object ( i.e http://npmjs.org/packages/config ) with MOCKING_PORT/FUNC_PORT set.
  //   2) process.env.MOCKING_PORT
  //   3) process.env.FUNC_PORT
  //   4) --mocking_port=NNN (process.argv)
  //
  // Rowdy also looks for a process.env.ROWDY_OPTIONS object, which we use to tell it
  // which port selenium is configured on.
  //
  // We've got a couple ways to tell a mocha client what its selenium / sauce / etc
  // settings are. Some of these apply for the `rowdy` module and some are up for
  // grabs to developers wiring up their own selenium harness:
  //
  //   1) ROWDY_SETTINGS - for rowdy, this is browser id with a special rowdy-specific prefix.
  //   2) NODE_CONFIG object ( i.e http://npmjs.org/packages/config ) with a desiredCapabilities field
  //      Used for non-rowdy-based integrations (e.g appium via saucelabs, user-defined integration, etc).
  //
  var mockingSettings = {
    MOCKING_PORT: this.mockingPort,
    FUNC_PORT: this.mockingPort,
    desiredCapabilities: this.sauceBrowserSettings
  };

  var nodeConfig = require("../lib/amend_node_config")(env, mockingSettings);

  var rowdySettings = {
    // Example values for rowdy:
    // "local.phantomjs"
    // "sauceLabs.safari_7_OS_X_10_9_Desktop"
    NODE_CONFIG: JSON.stringify(nodeConfig),
    ROWDY_SETTINGS: this.rowdyBrowser,
    ROWDY_OPTIONS: JSON.stringify({
      "server": {
        "port": this.seleniumPort
      },
      "client": {
        "port": this.seleniumPort
      }
    })
  };

  // Set tunnel id for Rowdy. Other integrations will have a tunnel id already set on desiredCapabilities
  if (this.tunnelId) {
    rowdySettings.SAUCE_CONNECT_TUNNEL_ID = this.tunnelId;
  }

  return _.extend({}, env, mockingSettings, rowdySettings);
};

RowdyMochaTestRun.prototype.getArguments = function () {
  var grepString = this.locator.name;

  var escapees = "\\^$[]+*.()\"";
  escapees.split("").forEach(function (ch) {
    grepString = grepString.split(ch).join("\\" + ch);
  });

  var args = [
    "--mocking_port=" + this.mockingPort,
    "--worker=1",
    "-g",
    grepString
  ];

  if (mochaSettings.mochaOpts) {
    args.push("--opts", mochaSettings.mochaOpts);
  }

  args = args.concat(mochaSettings.mochaTestFolders);

  return args;
};

module.exports = RowdyMochaTestRun;
