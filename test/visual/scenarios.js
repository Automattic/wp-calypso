// eslint-disable-next-line import/no-nodejs-modules
const fs = require( 'fs' );

const getScenarios = function () {
	const scenarios = [];

	const templates = [
		'bowen',
		'doyle',
		'reynolds',
		'rivington',
		'blog',
		'team',
		'services-2',
		'portfolio-3',
		'portfolio',
		'about-5',
		'about-4',
		'about-3',
		'about-2',
		'menu',
		'about',
		'edison',
		'cassel',
		'seedlet',
		'blog-2',
		'blog-3',
		'blog-4',
		'blog-5',
		'blog-6',
		'overton',
		'maywood',
		'easley',
		'camdem',
		'brice',
		'barnsbury',
		'vesta',
		'stratford',
		'rockfield',
		'leven',
		'gibbs',
		'coutoire',
		'balasana',
		'alves',
		'twenty-twenty',
		'shawburn',
		'exford',
		'morden',
		'stow',
		'hever',
		'portfolio-8',
		'portfolio-7',
		'portfolio-6',
		'portfolio-5',
		'portfolio-4',
		'portfolio-2',
		'services',
		'contact-10',
		'contact-9',
		'contact-8',
		'contact-6',
	];

	for ( let i = 0; i < templates.length; i++ ) {
		scenarios.push( {
			label: templates[ i ],
			url: 'https://wordpress.com/page/e2eflowtesting3.wordpress.com',
			referenceUrl: '',
			readyEvent: '',
			readySelector: '.edit-post-visual-editor',
			delay: 2000,
			hideSelectors: [],
			removeSelectors: [],
			hoverSelector: '',
			clickSelector: '',
			postInteractionWait: 0,
			selectors: [ '.edit-post-visual-editor' ],
			selectorExpansion: true,
			expect: 0,
			misMatchThreshold: 0.1,
			requireSameDimensions: true,
			onBeforeScript: 'puppeteer/set-cookies.js',
			onReadyScript: 'puppeteer/select-layout.js',
		} );
	}

	const themesJson = JSON.parse( fs.readFileSync( './test/visual/themesData.json' ) );

	for ( let i = 0; i < themesJson.length; i++ ) {
		const themesToSkip = [ 'easley', 'rivington', 'camdem' ];

		if ( themesToSkip.indexOf( themesJson[ i ].slug ) === -1 ) {
			scenarios.push( {
				label: `Preview - ${ themesJson[ i ].slug }`,
				url: themesJson[ i ].demo_url,
				referenceUrl: '',
				readyEvent: '',
				readySelector: 'body',
				delay: 2000,
				hideSelectors: [ '.site-info', 'footer' ],
				removeSelectors: [],
				hoverSelector: '',
				clickSelector: '',
				postInteractionWait: 0,
				selectors: [],
				selectorExpansion: true,
				expect: 0,
				misMatchThreshold: 0.1,
				requireSameDimensions: true,
				onBeforeScript: 'puppeteer/set-cookies.js',
				onReadyScript: 'puppeteer/load-preview.js',
			} );
		}
	}
	return scenarios;
};

module.exports = { getScenarios };
