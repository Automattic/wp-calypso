module.exports = {
	id: 'pre-test-login',
	viewports: [
		{
			label: 'desktop',
			width: 1200,
			height: 1000,
		},
	],
	scenarios: [
		{
			label: 'Login and Save Cookies - pretest',
			url: 'https://wordpress.com',
			referenceUrl: '',
			readyEvent: '',
			readySelector: '',
			delay: 500,
			hideSelectors: [],
			removeSelectors: [],
			hoverSelector: '',
			clickSelector: '',
			postInteractionWait: 0,
			selectors: [],
			selectorExpansion: true,
			expect: 0,
			misMatchThreshold: 0.1,
			requireSameDimensions: true,
			onBeforeScript: 'puppeteer/login.js',
		},
	],
	paths: {
		bitmaps_reference: 'test/visual/backstop_data_pretest/bitmaps_reference',
		bitmaps_test: 'test/visual/backstop_data_pretest/bitmaps_test',
		engine_scripts: 'test/visual/backstop_data/engine_scripts',
		html_report: 'test/visual/backstop_data_pretest/html_report',
		ci_report: 'test/visual/backstop_data_pretest/ci_report',
	},
	report: [ 'CI' ],
	engine: 'puppeteer',
	engineOptions: {
		args: [ '--no-sandbox' ],
	},
	asyncCaptureLimit: 5,
	asyncCompareLimit: 50,
	debug: false,
	debugWindow: false,
	dockerCommandTemplate:
		'docker run --rm -i --mount type=bind,source="{cwd}",target=/src backstopjs/backstopjs:{version} {backstopCommand} {args}',
};
