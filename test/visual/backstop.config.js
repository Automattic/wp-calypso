var scenarios = [];

const templates = [
	'bowen',
	'doyle',
	'reynolds',
	'rivington'
];

for (var i = 0; i < templates.length; i++) {

	scenarios.push({
		"label": templates[i],
		"url": "https://wordpress.com/page/e2eflowtesting3.wordpress.com",
		"referenceUrl": "",
		"readyEvent": "",
		"readySelector": "iframe.is-loaded",
		"delay": 2000,
		"hideSelectors": [],
		"removeSelectors": [],
		"hoverSelector": "",
		"clickSelector": "",
		"postInteractionWait": 0,
		"selectors": [],
		"selectorExpansion": true,
		"expect": 0,
		"misMatchThreshold": 0.1,
		"requireSameDimensions": true,
		"onBeforeScript": "puppeteer/set-cookies.js",
		"onReadyScript": "puppeteer/select-layout.js"
	});
}

module.exports = {
  "id": "backstop_default",
  "viewports": [
//    {
//      "label": "phone",
//      "width": 320,
//      "height": 1000
//    },
   {
     "label": "desktop",
     "width": 1200,
    "height": 1000
   }
  ],
  "scenarios": scenarios,
  "paths": {
    "bitmaps_reference": "test/visual/backstop_data/bitmaps_reference",
    "bitmaps_test": "test/visual/backstop_data/bitmaps_test",
    "engine_scripts": "test/visual/backstop_data/engine_scripts",
    "html_report": "test/visual/backstop_data/html_report",
    "ci_report": "test/visual/backstop_data/ci_report"
  },
  "report": ["browser"],
  "engine": "puppeteer",
  "engineOptions": {
    "args": [
    	"--no-sandbox",
		"--user-agent=Mozilla/5.0 (wp-e2e-tests) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90 Safari/537.36",
		"--app=https://www.wordpress.com"
	],
  },
  "asyncCaptureLimit": 5,
  "asyncCompareLimit": 50,
  "debug": false,
  "debugWindow": false
};
