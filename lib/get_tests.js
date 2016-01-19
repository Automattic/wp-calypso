var path = require("path");
var Locator = require("./locator");
var mochaSettings = require("./settings");
var reporter = path.resolve(__dirname, 'test_capture.js');

module.exports = function(settings) {
  var OUTPUT_PATH = path.resolve(settings.tempDir);
  var cmd = './node_modules/.bin/mocha';
  var args = ['--reporter', reporter];

  if (mochaSettings.mochaOpts) {
    args.push('--opts', mochaSettings.mochaOpts);
  }

  args = args.concat(mochaSettings.mochaTestFolders);

  process.env.MOCHA_CAPTURE_PATH = OUTPUT_PATH;
  var capture = spawnSync(cmd, args, {env: process.env});

  if (capture.status !== 0 || capture.stderr.toString()) {
    console.error('Could not capture mocha tests. To debug, run the following command:\nMOCHA_CAPTURE_PATH=%s %s %s', testOutputPath, cmd, args.join(' '));
    process.exit(1);
  }

  var tests = fs.readFileSync(OUTPUT_PATH, 'utf-8');
  fs.unlinkSync(OUTPUT_PATH);

  tests = JSON.parse(tests).map(function(t) {
    return new Locator(t.fullTitle, t.file);
  });

  return tests;
};
