const scenarios = require( './scenarios.js' );
const asyncCaptureLimit = process.env.CAPTURE_LIMIT ? process.env.CAPTURE_LIMIT : 5;
const asyncCompareLimit = process.env.COMPARE_LIMIT ? process.env.COMPARE_LIMIT : 50;

const scenarioList = scenarios.getScenarios();

const config = {
	id: 'visual-testing',
	viewports: [
		{
			label: 'desktop',
			width: 1200,
			height: 1000,
		},
	],
	scenarios: scenarioList,
	paths: {
		bitmaps_reference: 'test/visual/backstop_data/bitmaps_reference',
		bitmaps_test: 'test/visual/backstop_data/bitmaps_test',
		engine_scripts: 'test/visual/backstop_data/engine_scripts',
		html_report: 'test/visual/backstop_data/html_report',
		ci_report: 'test/visual/backstop_data/ci_report',
	},
	report: [ 'browser' ],
	engine: 'puppeteer',
	engineOptions: {
		args: [
			'--no-sandbox',
			'--user-agent=Mozilla/5.0 (wp-e2e-tests) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.85 Safari/537.36',
		],
	},
	asyncCaptureLimit: asyncCaptureLimit,
	asyncCompareLimit: asyncCompareLimit,
	debug: false,
	debugWindow: false,
	dockerCommandTemplate:
		'docker run --rm -i --mount type=bind,source="{cwd}",target=/src backstopjs/backstopjs:{version} {backstopCommand} {args}',
};

module.exports = config;
