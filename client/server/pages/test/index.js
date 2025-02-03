import { IncomingMessage } from 'http';
import cloneDeep from 'lodash/cloneDeep';
import mockFs from 'mock-fs';
import sections from 'calypso/sections';

jest.mock( 'browserslist-useragent', () => ( {
	matchesUA: jest.fn(),
} ) );

jest.mock( 'child_process', () => ( {
	execSync: jest.fn(),
} ) );

jest.mock( 'superagent', () => jest.fn() );

jest.mock( '@automattic/calypso-config', () => {
	const impl = jest.fn();
	impl.isEnabled = jest.fn();
	return impl;
} );

jest.mock( 'calypso/server/sanitize', () => jest.fn() );

jest.mock( 'calypso/server/bundler/utils', () => ( {
	hashFile: jest.fn( () => 'hash' ),
	getUrl: jest.fn( jest.requireActual( 'calypso/server/bundler/utils' ).getUrl ),
} ) );

jest.mock( 'calypso/sections', () => {
	// eslint-disable-next-line no-shadow
	const sections = jest.requireActual( 'calypso/sections' );
	sections
		.filter( ( section ) => section.isomorphic )
		.forEach( ( section ) => {
			section.load = jest.fn( () => ( {
				default: jest.fn(),
			} ) );
		} );
	return sections;
} );

jest.mock( 'calypso/sections-filter', () => jest.fn( () => true ) );

jest.mock( 'calypso/login', () => {
	const impl = jest.fn();
	impl.LOGIN_SECTION_DEFINITION = {
		name: 'login',
		paths: [ '/log-in' ],
		module: 'login',
		enableLoggedOut: true,
		isomorphic: true,
	};
	return impl;
} );

jest.mock( 'calypso/server/isomorphic-routing', () => ( {
	serverRouter: jest.fn(),
	getNormalizedPath: jest.fn(),
	getCacheKey: jest.fn(),
} ) );

jest.mock( 'calypso/server/render', () => ( {
	serverRender: jest.fn(),
	renderJsx: jest.fn(),
	attachBuildTimestamp: jest.fn(),
	attachHead: jest.fn(),
	attachI18n: jest.fn(),
} ) );

jest.mock( 'calypso/server/state-cache', () => new Map() );

jest.mock( 'calypso/server/user-bootstrap', () => jest.fn() );

jest.mock( 'calypso/state', () => ( {
	createReduxStore: jest.fn(),
} ) );

jest.mock( 'calypso/state/redux-store', () => ( {
	setStore: jest.fn(),
	registerReducer: jest.fn(),
} ) );

jest.mock( 'calypso/state/reducer', () => jest.fn() );

jest.mock( 'calypso/state/current-user/actions', () => ( {
	setCurrentUser: jest.fn(),
} ) );

jest.mock( 'calypso/lib/paths', () => ( {
	login: jest.fn(),
} ) );

jest.mock( './analytics', () => ( {
	logSectionResponse: jest.fn(),
} ) );

jest.mock( 'calypso/server/lib/analytics', () => ( {
	tracks: {
		recordEvent: jest.fn(),
	},
} ) );

jest.mock( 'calypso/lib/i18n-utils', () => ( {
	getLanguage: jest.fn( ( lang ) => ( { langSlug: lang } ) ),
	filterLanguageRevisions: jest.fn(),
} ) );

jest.mock( 'calypso/lib/oauth2-clients', () => ( {
	isWooOAuth2Client: jest.fn(),
} ) );

/**
 * Builds an app for an specific environment.
 *
 * This test has a complex setup because the environment. Loading the environment is a side
 * effect perform when `../index.js` is imported, so it is tricky to mock. Instead of spreading
 * this logic across all tests, we have a builder pattern to load the app.
 *
 * As it uses isolated registries, any mock set outside this builder won't be visible for the
 * built app. That's why we need to require mocks here and expose them via getMocks();
 * @param environment the environment
 */
const buildApp = ( environment ) => {
	let mocks = {};
	const tearDown = [];
	let defaultUrl = '/';
	const defaultCookies = {};

	// We need to restore modules and filesystem so requiring modules inside `isolatedModules` works
	mockFs.restore();
	jest.resetModules();

	// Load the app
	let appFactory;
	jest.isolateModules( () => {
		// When the app requries these modules, they are loaded from its isolated registry.
		// Requiring them here will give us the same instance used by the app, this will allow
		// us to change the mock implementation later or make assertions about it.
		mocks.config = require( '@automattic/calypso-config' );
		mocks.matchesUA = require( 'browserslist-useragent' ).matchesUA;
		const {
			attachBuildTimestamp,
			attachI18n,
			attachHead,
			renderJsx,
			serverRender,
		} = require( 'calypso/server/render' );
		mocks = { ...mocks, attachBuildTimestamp, attachI18n, attachHead, renderJsx, serverRender };
		mocks.sanitize = require( 'calypso/server/sanitize' );
		mocks.createReduxStore = require( 'calypso/state' ).createReduxStore;
		mocks.execSync = require( 'child_process' ).execSync;
		mocks.login = require( 'calypso/lib/paths' ).login;
		mocks.getBootstrappedUser = require( 'calypso/server/user-bootstrap' );
		mocks.setCurrentUser = require( 'calypso/state/current-user/actions' ).setCurrentUser;
		mocks.analytics = require( 'calypso/server/lib/analytics' );

		// Set the environment. This has to be done before requiring `../index.js`
		mocks.config.mockImplementation(
			( key ) =>
				( {
					hostname: 'valid.hostname',
					magnificent_non_en_locales: [ 'ar', 'es' ],
					port: 3000,
					env_id: environment,
					rtl: false,
					i18n_default_locale_slug: 'en',
					favicon_url: 'http://favicon.url/',
					enable_all_sections: true,
				} )[ key ]
		);

		appFactory = require( '../index' ).default;
	} );
	const app = appFactory();

	return {
		withUrl( url ) {
			defaultUrl = url;
			tearDown.push( () => ( defaultUrl = '/' ) );
		},
		withAuthenticatedUser() {
			defaultCookies.wordpress_logged_in = true;
			tearDown.push( () => delete defaultCookies.wordpress_logged_in );
		},
		withAnonymousUser() {
			defaultCookies.wordpress_logged_in = false;
			tearDown.push( () => delete defaultCookies.wordpress_logged_in );
		},
		withMockFilesystem() {
			const assetsList = [
				'/calypso/evergreen/entry-main.1.min.js',
				'/calypso/evergreen/entry-main.2.min.js',
				'/calypso/evergreen/entry-main.3.min.css',
				'/calypso/evergreen/entry-main.4.min.rtl.css',
			];
			const assets = {
				manifests: [
					'/* webpack manifest for evergreen */',
					'/* webpack runtime for evergreen */',
				],
				assets: {
					'entry-main': assetsList,
					'entry-domains-landing': assetsList.map( ( asset ) =>
						asset.replace( 'entry-main', 'entry-domains-landing' )
					),
					'entry-gutenboarding': assetsList.map( ( asset ) =>
						asset.replace( 'entry-main', 'entry-gutenboarding' )
					),
					'entry-browsehappy': assetsList.map( ( asset ) =>
						asset.replace( 'entry-main', 'entry-browsehappy' )
					),
					...Object.fromEntries(
						sections.map( ( section ) => [
							section.name,
							[
								`/calypso/evergreen/${ section.name }.js`,
								`/calypso/evergreen/${ section.name }.css`,
								`/calypso/evergreen/${ section.name }.rtl.css`,
							],
						] )
					),
				},
			};
			mockFs( {
				'./build/assets.json': JSON.stringify( assets ),
				'./public/languages/lang-revisions.json': JSON.stringify( { es: 1234 } ),
			} );
			tearDown.push( () => mockFs.restore() );
		},
		withEvergreenBrowser() {
			mocks.matchesUA.mockImplementation( () => true );
			tearDown.push( () => mocks.matchesUA.mockReset() );
			return this;
		},
		withNonEvergreenBrowser() {
			mocks.matchesUA.mockImplementation( () => false );
			tearDown.push( () => mocks.matchesUA.mockReset() );
			return this;
		},
		withConfigEnabled( enabledOptions ) {
			mocks.config.isEnabled.mockImplementation( ( key ) => {
				return enabledOptions[ key ];
			} );
			tearDown.push( () => mocks.config.isEnabled.mockReset() );
		},
		withMockedVariable( object, name, value ) {
			const valueExists = name in object;
			const oldValue = object[ name ];
			object[ name ] = value;
			tearDown.push( () => {
				// If there was an old value, restore it. Otherwise delete
				// the mocked value. This is required for process.env
				if ( valueExists ) {
					object[ name ] = oldValue;
				} else {
					delete object[ name ];
				}
			} );
		},
		withRenderJSX( value ) {
			mocks.renderJsx.mockImplementation( () => value );
			tearDown.push( () => mocks.renderJsx.mockReset() );
		},
		withFailedRenderJSX( error ) {
			mocks.renderJsx.mockImplementation( () => {
				throw error;
			} );
			tearDown.push( () => mocks.renderJsx.mockReset() );
		},
		withExecCommands( commands ) {
			mocks.execSync.mockImplementation( ( command ) => commands[ command ] );
			tearDown.push( () => mocks.execSync.mockReset() );
		},
		withServerRender( output ) {
			mocks.serverRender.mockImplementation( ( req, res ) => res.send( output ) );
			tearDown.push( () => mocks.serverRender.mockReset() );
		},
		withBootstrapUser( user ) {
			mocks.getBootstrappedUser.mockImplementation( () => Promise.resolve( user ) );
			tearDown.push( () => mocks.getBootstrappedUser.mockReset() );
		},
		withFailedBootstrapUser( error ) {
			mocks.getBootstrappedUser.mockImplementation( () => Promise.reject( error ) );
			tearDown.push( () => mocks.getBootstrappedUser.mockReset() );
		},
		withReduxStore( store ) {
			mocks.createReduxStore.mockImplementation( () => store );
			tearDown.push( () => mocks.createReduxStore.mockReset() );
		},
		withSetCurrentAction( action ) {
			mocks.setCurrentUser.mockImplementation( () => action );
			tearDown.push( () => mocks.setCurrentUser.mockReset() );
		},
		run( { request = {}, response = {} } = {} ) {
			return new Promise( ( resolve ) => {
				const mockRequest = Object.assign( new IncomingMessage(), {
					body: {},
					cookies: defaultCookies,
					query: {},
					params: {},
					// Setup by parent app using 'express-useragent'
					useragent: {
						source: '',
					},
					headers: {
						'user-agent': '',
					},
					url: defaultUrl,
					method: 'GET',
					get: jest.fn(),
					socket: {},
					logger: {
						error: jest.fn(),
					},
					...request,
				} );

				// Using cloneDeep to capture the state of the request/response objects right now, in case
				// an async middleware changes them _after_ the request handler has been executed
				const mockResponse = {
					setHeader: jest.fn(),
					getHeader: jest.fn(),
					clearCookie: jest.fn(),
					send: jest.fn( () => {
						resolve( {
							request: cloneDeep( mockRequest ),
							response: cloneDeep( mockResponse ),
						} );
					} ),
					end: jest.fn( () => {
						resolve( {
							request: cloneDeep( mockRequest ),
							response: cloneDeep( mockResponse ),
						} );
					} ),
					redirect: jest.fn( () => {
						resolve( {
							request: cloneDeep( mockRequest ),
							response: cloneDeep( mockResponse ),
						} );
					} ),
					...response,
				};

				app( mockRequest, mockResponse );
			} );
		},
		getMocks() {
			return mocks;
		},
		reset() {
			tearDown.forEach( ( method ) => method() );
			tearDown.length = 0;
		},
	};
};

const assertDefaultContext = ( { url, entry } ) => {
	let app;

	beforeAll( () => {
		// Building an app is expensive, so we build it once here and set its mocks before each test.
		app = buildApp( 'production' );
	} );

	beforeEach( () => {
		app.withUrl( url );
		app.withConfigEnabled( { 'use-translation-chunks': true } );
		app.withServerRender( '' );
		app.withMockFilesystem();
		app.withEvergreenBrowser();
	} );

	afterEach( () => {
		app.reset();
	} );

	it( 'sets the commit sha using the value from COMMIT_SHA', async () => {
		app.withMockedVariable( process.env, 'COMMIT_SHA', 'abcabc' );
		const { request } = await app.run();
		expect( request.context.commitSha ).toBe( 'abcabc' );
	} );

	it( 'sets the commit sha to "(unknown)"', async () => {
		const { request } = await app.run();
		expect( request.context.commitSha ).toBe( '(unknown)' );
	} );

	it( 'sets the debug mode for the compiler', async () => {
		const { request } = await app.run();
		expect( request.context.compileDebug ).toBe( false );
	} );

	it( 'sets the user to false', async () => {
		const { request } = await app.run();
		expect( request.context.user ).toBe( false );
	} );

	it( 'sets the environment', async () => {
		const { request } = await app.run();
		expect( request.context.env ).toBe( 'production' );
	} );

	it( 'sets the sanitize method', async () => {
		const { request } = await app.run();
		expect( request.context.sanitize ).toEqual( app.getMocks().sanitize );
	} );

	it( 'sets requestFrom', async () => {
		const { request } = await app.run( { request: { query: { from: 'from' } } } );
		expect( request.context.requestFrom ).toEqual( 'from' );
	} );

	it( 'sets lang to the default', async () => {
		const { request } = await app.run();
		expect( request.context.lang ).toEqual( 'en' );
	} );

	if ( entry ) {
		it( 'sets the entrypoint', async () => {
			const { request } = await app.run();
			expect( request.context.entrypoint ).toEqual( {
				js: [ `/calypso/evergreen/${ entry }.1.min.js`, `/calypso/evergreen/${ entry }.2.min.js` ],
				'css.ltr': [ `/calypso/evergreen/${ entry }.3.min.css` ],
				'css.rtl': [ `/calypso/evergreen/${ entry }.4.min.rtl.css` ],
			} );
		} );
	}

	it( 'sets the manifest', async () => {
		const { request } = await app.run();
		expect( request.context.manifests ).toEqual( [
			'/* webpack manifest for evergreen */',
			'/* webpack runtime for evergreen */',
		] );
	} );

	it( 'sets the featuresHelper when config is enabled', async () => {
		app.withConfigEnabled( { 'dev/features-helper': true } );
		const { request } = await app.run();
		expect( request.context.featuresHelper ).toEqual( true );
	} );

	it( 'sets the featuresHelper when config is disabled', async () => {
		app.withConfigEnabled( { 'dev/features-helper': false } );
		const { request } = await app.run();
		expect( request.context.featuresHelper ).toEqual( false );
	} );

	it( 'sets devDocsUrl', async () => {
		const { request } = await app.run();
		expect( request.context.devDocsURL ).toEqual( '/devdocs' );
	} );

	it( 'sets redux store', async () => {
		const theStore = {};
		app.withReduxStore( theStore );

		const { request } = await app.run();

		expect( request.context.store ).toEqual( theStore );
	} );

	describe( 'sets the target in production mode', () => {
		beforeEach( () => {
			app.withMockedVariable( process.env, 'NODE_ENV', 'production' );
		} );

		it( 'serves evergreen for all browsers', async () => {
			const { request } = await app.run();
			expect( request.context.target ).toEqual( 'evergreen' );
		} );
	} );

	it( 'translations chunks can be disabled', async () => {
		app.withConfigEnabled( { 'use-translation-chunks': false } );
		const { request } = await app.run();
		expect( request.context.useTranslationChunks ).toEqual( false );
	} );

	it( 'uses translations chunks when enabled in the config', async () => {
		app.withConfigEnabled( { 'use-translation-chunks': true } );
		const { request } = await app.run();
		expect( request.context.useTranslationChunks ).toEqual( true );
	} );

	it( 'uses translations chunks when enabled in the request flags', async () => {
		const { request } = await app.run( { query: { flags: 'use-translation-chunks' } } );
		expect( request.context.useTranslationChunks ).toEqual( true );
	} );

	it( 'uses translations chunks when specified in the request', async () => {
		const { request } = await app.run( { query: { useTranslationChunks: true } } );
		expect( request.context.useTranslationChunks ).toEqual( true );
	} );

	it( 'sets the client ip', async () => {
		const { request } = await app.run( { request: { ip: '192.168.0.1' } } );
		expect( request.context.app.clientIp ).toEqual( '192.168.0.1' );
	} );

	it( 'sets the client ip replacing the ipv6 prefix for ipv4 addresses', async () => {
		const { request } = await app.run( { request: { ip: '::ffff:192.168.0.1' } } );
		expect( request.context.app.clientIp ).toEqual( '192.168.0.1' );
	} );

	it( 'debug mode is disabled by default', async () => {
		const { request } = await app.run();
		expect( request.context.app.isDebug ).toEqual( false );
	} );

	it( 'debug mode is enabled if the query parameter is present', async () => {
		const { request } = await app.run( { request: { query: { debug: true } } } );
		expect( request.context.app.isDebug ).toEqual( true );
	} );

	it( 'debug mode is enabled for development environment', async () => {
		const customApp = buildApp( 'development' );
		customApp.withServerRender( '' );
		customApp.withMockFilesystem();
		customApp.withEvergreenBrowser();
		const { request } = await customApp.run();
		expect( request.context.app.isDebug ).toEqual( true );
	} );

	it( 'debug mode is enabled for jetpack-cloud-development environment', async () => {
		const customApp = buildApp( 'jetpack-cloud-development' );
		customApp.withServerRender( '' );
		customApp.withMockFilesystem();
		customApp.withEvergreenBrowser();
		const { request } = await customApp.run();
		expect( request.context.app.isDebug ).toEqual( true );
	} );

	describe( 'with environment wpcalypso', () => {
		let customApp;

		beforeAll( () => {
			customApp = buildApp( 'wpcalypso' );
		} );

		beforeEach( () => {
			customApp.withServerRender( '' );
			customApp.withMockFilesystem();
			customApp.withEvergreenBrowser();
		} );

		afterEach( () => {
			customApp.reset();
		} );

		it( 'sets the badge', async () => {
			const { request } = await customApp.run();
			expect( request.context.badge ).toEqual( 'wpcalypso' );
		} );

		it( 'sets devDocs', async () => {
			const { request } = await customApp.run();
			expect( request.context.devDocs ).toEqual( true );
		} );

		it( 'sets the feedback url', async () => {
			const { request } = await customApp.run();
			expect( request.context.feedbackURL ).toEqual(
				'https://github.com/Automattic/wp-calypso/issues/'
			);
		} );

		it( 'sets the branch name', async () => {
			const { request } = await customApp.run( {
				request: { query: { branch: 'my-branch' } },
			} );
			expect( request.context.branchName ).toEqual( 'my-branch' );
		} );
	} );

	describe( 'with environment horizon', () => {
		let customApp;

		beforeAll( () => {
			customApp = buildApp( 'horizon' );
		} );

		beforeEach( () => {
			customApp.withServerRender( '' );
			customApp.withMockFilesystem();
			customApp.withEvergreenBrowser();
		} );

		afterEach( () => {
			customApp.reset();
		} );

		it( 'sets the badge', async () => {
			const { request } = await customApp.run();
			expect( request.context.badge ).toEqual( 'feedback' );
		} );

		it( 'sets the feedback url', async () => {
			const { request } = await customApp.run();
			expect( request.context.feedbackURL ).toEqual( 'https://horizonfeedback.wordpress.com/' );
		} );
	} );

	describe( 'with environment stage', () => {
		let customApp;

		beforeAll( () => {
			customApp = buildApp( 'stage' );
		} );

		beforeEach( () => {
			customApp.withServerRender( '' );
			customApp.withMockFilesystem();
			customApp.withEvergreenBrowser();
		} );

		afterEach( () => {
			customApp.reset();
		} );

		it( 'sets the badge', async () => {
			const { request } = await customApp.run();
			expect( request.context.badge ).toEqual( 'staging' );
		} );

		it( 'sets the feedback url', async () => {
			const { request } = await customApp.run();
			expect( request.context.feedbackURL ).toEqual(
				'https://github.com/Automattic/wp-calypso/issues/'
			);
		} );
	} );

	describe( 'with environment development', () => {
		let customApp;

		beforeAll( () => {
			customApp = buildApp( 'development' );
		} );

		beforeEach( () => {
			customApp.withServerRender( '' );
			customApp.withMockFilesystem();
			customApp.withEvergreenBrowser();
			customApp.withExecCommands( {
				'git rev-parse --abbrev-ref HEAD': 'my-branch',
				'git rev-parse --short HEAD': 'abcd0123',
			} );
		} );

		afterEach( () => {
			customApp.reset();
		} );

		it( 'sets the badge', async () => {
			const { request } = await customApp.run();
			expect( request.context.badge ).toEqual( 'dev' );
		} );

		it( 'sets devDocs', async () => {
			const { request } = await customApp.run();
			expect( request.context.devDocs ).toEqual( true );
		} );

		it( 'sets the feedback url', async () => {
			const { request } = await customApp.run();
			expect( request.context.feedbackURL ).toEqual(
				'https://github.com/Automattic/wp-calypso/issues/'
			);
		} );

		it( 'sets the branch name', async () => {
			const { request } = await customApp.run();
			expect( request.context.branchName ).toEqual( 'my-branch' );
		} );

		it( 'sets the commit checksum', async () => {
			const { request } = await customApp.run();
			expect( request.context.commitChecksum ).toEqual( 'abcd0123' );
		} );
	} );

	describe( 'with environment jetpack-cloud-stage', () => {
		let customApp;

		beforeAll( () => {
			customApp = buildApp( 'jetpack-cloud-stage' );
		} );

		beforeEach( () => {
			customApp.withServerRender( '' );
			customApp.withMockFilesystem();
			customApp.withEvergreenBrowser();
		} );

		afterEach( () => {
			customApp.reset();
		} );

		it( 'sets the badge', async () => {
			const { request } = await customApp.run();
			expect( request.context.badge ).toEqual( 'jetpack-cloud-staging' );
		} );

		it( 'sets the feedback url', async () => {
			const { request } = await customApp.run();
			expect( request.context.feedbackURL ).toEqual(
				'https://github.com/Automattic/wp-calypso/issues/'
			);
		} );
	} );

	describe( 'with environment jetpack-cloud-development', () => {
		let customApp;

		beforeAll( () => {
			customApp = buildApp( 'jetpack-cloud-development' );
		} );

		beforeEach( () => {
			customApp.withServerRender( '' );
			customApp.withMockFilesystem();
			customApp.withEvergreenBrowser();
			customApp.withExecCommands( {
				'git rev-parse --abbrev-ref HEAD': 'my-branch',
				'git rev-parse --short HEAD': 'abcd0123',
			} );
		} );

		afterEach( () => {
			customApp.reset();
		} );

		it( 'sets the badge', async () => {
			const { request } = await customApp.run();
			expect( request.context.badge ).toEqual( 'jetpack-cloud-dev' );
		} );

		it( 'sets the feedback url', async () => {
			const { request } = await customApp.run();
			expect( request.context.feedbackURL ).toEqual(
				'https://github.com/Automattic/wp-calypso/issues/'
			);
		} );

		it( 'sets the branch name', async () => {
			const { request } = await customApp.run();
			expect( request.context.branchName ).toEqual( 'my-branch' );
		} );

		it( 'sets the commit checksum', async () => {
			const { request } = await customApp.run();
			expect( request.context.commitChecksum ).toEqual( 'abcd0123' );
		} );
	} );
};

const assertSection = ( { url, entry, sectionName, sectionGroup } ) => {
	let app;

	beforeAll( () => {
		// Building an app is expensive, so we build it once here and set its mocks before each test.
		app = buildApp( 'production' );
	} );

	beforeEach( () => {
		app.withUrl( url );
		app.withConfigEnabled( { 'use-translation-chunks': true } );
		app.withServerRender( '' );
		app.withMockFilesystem();
		app.withEvergreenBrowser();
	} );

	afterEach( () => {
		app.reset();
	} );

	it( `handles path ${ url } with section "${ sectionName }"`, async () => {
		const { request } = await app.run();
		expect( request.context.sectionName ).toBe( sectionName );
	} );

	it( 'captures the group of the section', async () => {
		const { request } = await app.run();
		expect( request.context.sectionGroup ).toBe( sectionGroup );
	} );

	if ( entry ) {
		it( 'do not set chunkFiles for sections with associated entrypoints for evergreen browsers', async () => {
			const { request } = await app.withEvergreenBrowser().run();
			expect( request.context.chunkFiles ).toEqual( {
				'css.ltr': [],
				'css.rtl': [],
				js: [],
			} );
		} );
	} else {
		it( 'sets chunkFiles for evergreen browsers', async () => {
			const { request } = await app.withEvergreenBrowser().run();
			expect( request.context.chunkFiles ).toEqual( {
				'css.ltr': [ `/calypso/evergreen/${ sectionName }.css` ],
				'css.rtl': [ `/calypso/evergreen/${ sectionName }.rtl.css` ],
				js: [ `/calypso/evergreen/${ sectionName }.js` ],
			} );
		} );
	}

	it( 'renders the section', async () => {
		app.withServerRender( 'output' );

		const { response } = await app.run();

		expect( response.statusCode ).toBe( 200 );
		expect( response.send ).toHaveBeenCalledWith( 'output' );
	} );

	describe( 'for authenticated users', () => {
		let theStore;
		let theAction;

		beforeEach( () => {
			theStore = {
				dispatch: jest.fn(),
			};
			theAction = {};

			// This method resets the existing enabled config, we need to re-enable 'use-translation-chunks'.
			app.withAuthenticatedUser();
			app.withConfigEnabled( {
				'wpcom-user-bootstrap': true,
				'use-translation-chunks': true,
			} );
			app.withBootstrapUser( {} );
			app.withReduxStore( theStore );
			app.withSetCurrentAction( theAction );
		} );

		it( 'sets frame options', async () => {
			const { response } = await app.run();
			expect( response.setHeader ).toHaveBeenCalledWith( 'X-Frame-Options', 'SAMEORIGIN' );
		} );

		it( 'sets language revisions for evergreen browsers', async () => {
			app.withEvergreenBrowser();
			const { request } = await app.run();
			expect( request.context.languageRevisions ).toEqual( { es: 1234 } );
		} );

		it( 'gets the redirect url for https requests', async () => {
			await app.run( {
				request: {
					get: jest.fn( ( header ) => ( header === 'X-Forwarded-Proto' ? 'https' : undefined ) ),
				},
			} );
			expect( app.getMocks().login ).toHaveBeenCalledWith( {
				redirectTo: `https://valid.hostname${ url }`,
			} );
		} );

		it( 'gets the redirect url for http requests', async () => {
			await app.run( {
				request: {
					get: jest.fn( ( header ) => ( header === 'X-Forwarded-Proto' ? 'http' : undefined ) ),
				},
			} );
			expect( app.getMocks().login ).toHaveBeenCalledWith( {
				redirectTo: `http://valid.hostname${ url }`,
			} );
		} );

		it( 'saves the user in the context', async () => {
			const theUser = {};
			app.withBootstrapUser( theUser );

			const { request } = await app.run();

			expect( request.context.user ).toEqual( theUser );
		} );

		it( 'sets the locale in the store', async () => {
			const theUser = {
				localeSlug: 'es',
				localeVariant: 'ES',
			};
			app.withBootstrapUser( theUser );

			const { request } = await app.run();

			expect( request.context.lang ).toEqual( 'es' );
			expect( theStore.dispatch ).toHaveBeenCalledWith( {
				type: 'LOCALE_SET',
				localeSlug: 'es',
				localeVariant: 'ES',
			} );
		} );

		it( 'redirects the user if public API authorization is required', () =>
			// eslint-disable-next-line no-async-promise-executor
			new Promise( async ( done ) => {
				app.withFailedBootstrapUser( { error: 'authorization_required' } );
				app.getMocks().login.mockImplementation( ( { redirectTo } ) => redirectTo );
				// Even after the redirect, it will log the error. Silence the error output to make Jest happy.
				jest.spyOn( console, 'error' ).mockImplementation( () => {} );

				const { response } = await app.run();

				expect( response.redirect ).toHaveBeenCalledWith( `http://valid.hostname${ url }` );

				// The redirects abive will leave the promise in `setUpLocalLanguageRevisions()`
				// pending, and because we are mocking the filesystem, it will fail when we tear down the
				// test and output something to the console. Jest will detect it and show an error because
				// you are not supossed to log anything after the test is done.
				//
				// This timer should give time to that promise to fail within the test.
				setTimeout( done, 5 );
			} ) );
	} );

	describe( 'for anonymous users', () => {
		beforeEach( () => {
			app.withAnonymousUser();
		} );

		it( 'sets frame options', async () => {
			const { response } = await app.run();
			expect( response.setHeader ).toHaveBeenCalledWith( 'X-Frame-Options', 'SAMEORIGIN' );
		} );

		it( 'sets language revisions for evergreen browsers', async () => {
			app.withEvergreenBrowser();
			const { request } = await app.run();
			expect( request.context.languageRevisions ).toEqual( { es: 1234 } );
		} );
	} );

	describe( 'default context', () => {
		assertDefaultContext( { url, entry } );
	} );
};

describe( 'main app', () => {
	let app;

	beforeAll( () => {
		// Building an app is expensive, so we build it once here and set its mocks before each test.
		app = buildApp( 'production' );
	} );

	beforeEach( () => {
		app.withConfigEnabled( { 'use-translation-chunks': true } );
		app.withServerRender( '' );
		app.withMockFilesystem();
		app.withEvergreenBrowser();
	} );

	afterEach( async () => {
		jest.clearAllMocks();
		app.reset();
	} );

	describe( 'Middleware loggedInContext', () => {
		it( 'detects if it is a support session based on a header', async () => {
			const { request } = await app.run( {
				request: { get: jest.fn( ( header ) => header === 'x-support-session' ) },
			} );
			expect( request.context.isSupportSession ).toBe( true );
		} );

		it( 'detects if it is a support session based on a cookie', async () => {
			const { request } = await app.run( { request: { cookies: { support_session_id: true } } } );
			expect( request.context.isSupportSession ).toBe( true );
		} );

		it( 'detects if it is logged in based on a cookie', async () => {
			const { request } = await app.run( { request: { cookies: { wordpress_logged_in: true } } } );
			expect( request.context.isLoggedIn ).toBe( true );
		} );
	} );

	describe( 'Route /sites/:site/:section', () => {
		[
			{ section: 'posts', url: '/posts/my-site' },
			{ section: 'pages', url: '/pages/my-site' },
			{ section: 'sharing', url: '/sharing/my-site' },
			{ section: 'upgrade', url: '/upgrade/my-site' },
			{ section: 'checkout', url: '/checkout/my-site' },
			{ section: 'change-theme', url: '/themes' },
		].forEach( ( { section, url } ) => {
			it( `Redirects from old newdash format (section ${ section })`, async () => {
				const { response } = await app.run( { request: { url: `/sites/my-site/${ section }` } } );
				expect( response.redirect ).toHaveBeenCalledWith( url );
			} );
		} );
	} );

	describe( 'Route /plans', () => {
		it( 'redirects to login if the request is for jetpack', async () => {
			const { response } = await app.run( {
				request: { url: '/plans', query: { for: 'jetpack' } },
			} );
			expect( response.redirect ).toHaveBeenCalledWith(
				'https://wordpress.com/wp-login.php?redirect_to=https%3A%2F%2Fwordpress.com%2Fplans'
			);
		} );
		it( 'redirects to public pricing page with coupon and ref params', async () => {
			app.withConfigEnabled( {
				'jetpack-cloud/connect': false,
			} );
			const { response } = await app.run( {
				request: { url: '/plans', query: { ref: 'test', coupon: 'test' } },
			} );
			expect( response.redirect ).toHaveBeenCalledWith(
				'https://wordpress.com/pricing/?ref=test&coupon=test'
			);
		} );
	} );

	describe( 'Route /menus', () => {
		it( 'redirects to menus when there is a site', async () => {
			const { response } = await app.run( { request: { url: '/menus/my-site' } } );
			expect( response.redirect ).toHaveBeenCalledWith( 301, '/customize/menus/my-site' );
		} );

		it( 'redirects to menus when there is not a site', async () => {
			const { response } = await app.run( { request: { url: '/menus' } } );
			expect( response.redirect ).toHaveBeenCalledWith( 301, '/customize/menus/' );
		} );
	} );

	describe( 'Route /domains', () => {
		it( 'redirects from /domains to /start/domain', async () => {
			const { response } = await app.run( { request: { url: '/domains' } } );
			expect( response.redirect ).toHaveBeenCalledWith( '/start/domain' );
		} );

		it( 'redirects from /domains to /start/domain with selected domain', async () => {
			const { response } = await app.run( {
				request: { url: '/domains', query: { new: 'my-domain.com' } },
			} );
			expect( response.redirect ).toHaveBeenCalledWith( '/start/domain?new=my-domain.com' );
		} );

		it( 'redirects from /start/domain-first to /start/domain', async () => {
			const { response } = await app.run( { request: { url: '/start/domain-first' } } );
			expect( response.redirect ).toHaveBeenCalledWith( '/start/domain' );
		} );

		it( 'redirects from /start/domain-first to /start/domain with selected domain', async () => {
			const { response } = await app.run( {
				request: { url: '/start/domain-first', query: { new: 'my-domain.com' } },
			} );
			expect( response.redirect ).toHaveBeenCalledWith( '/start/domain?new=my-domain.com' );
		} );
	} );

	describe( 'Route /domain-services/:action', () => {
		it( 'attaches info to the context form server/render', async () => {
			const { attachBuildTimestamp, attachI18n, attachHead } = app.getMocks();
			await app.run( { request: { url: '/domain-services/renovate' } } );
			expect( attachBuildTimestamp ).toHaveBeenCalled();
			expect( attachI18n ).toHaveBeenCalled();
			expect( attachHead ).toHaveBeenCalled();
		} );

		it( 'adds clientData to the context', async () => {
			app.getMocks().config.clientData = { client: 'data' };
			const { request } = await app.run( { request: { url: '/domain-services/renovate' } } );
			expect( request.context.clientData ).toEqual( { client: 'data' } );
		} );

		it( 'adds domainsLandingData to the context', async () => {
			const { request } = await app.run( {
				request: { url: '/domain-services/renovate', query: { domain: 'test' } },
			} );
			expect( request.context.domainsLandingData ).toEqual( {
				action: 'renovate',
				query: {
					domain: 'test',
				},
			} );
		} );

		it( 'renders domains-landing page', async () => {
			app.withRenderJSX( '<div>page</div>' );
			const { renderJsx } = app.getMocks();
			const { response } = await app.run( {
				request: { url: '/domain-services/renovate', query: { domain: 'test' } },
			} );
			expect( renderJsx ).toHaveBeenCalledWith(
				'domains-landing',
				expect.objectContaining( {
					domainsLandingData: {
						action: 'renovate',
						query: {
							domain: 'test',
						},
					},
				} )
			);
			expect( response.send ).toHaveBeenCalledWith( '<div>page</div>' );
		} );

		describe( 'default context', () => {
			assertDefaultContext( {
				url: '/domain-services/renovate',
				entry: 'entry-domains-landing',
			} );
		} );
	} );

	describe( `Route /home`, () => {
		assertSection( {
			url: '/home',
			sectionName: 'home',
			sectionGroup: 'sites',
		} );
	} );

	describe( `Route /sites`, () => {
		assertSection( {
			url: '/sites',
			sectionName: 'sites-dashboard',
			sectionGroup: 'sites-dashboard',
		} );
	} );

	describe( `Route /`, () => {
		assertSection( {
			url: '/',
			sectionName: 'root',
			sectionGroup: 'root',
		} );

		describe( 'redirects', () => {
			beforeEach( () => {
				app.withConfigEnabled( {
					'wpcom-user-bootstrap': true,
					'use-translation-chunks': true,
				} );
				app.withBootstrapUser( {} );
				app.withReduxStore( {
					dispatch: jest.fn(),
				} );
			} );

			afterEach(
				() =>
					new Promise( ( done ) => {
						// The redirects in this section will leave the promise in `setUpLocalLanguageRevisions()`
						// pending, and because we are mocking the filesystem, it will fail when we tear down the
						// test and output something to the console. Jest will detect it and show an error because
						// you are not supossed to log anything after the test is done.
						//
						// This timer should give time to that promise to fail within the test.
						setTimeout( done, 5 );
					} )
			);

			it( 'redirects to stats if reader is disabled', async () => {
				app.withConfigEnabled( { reader: false, stats: true } );
				const { response } = await app.run( { request: { url: '/' } } );
				expect( response.redirect ).toHaveBeenCalledWith( '/stats' );
			} );

			it( 'redirects to search when passing "s" as the query', async () => {
				// eslint-disable-next-line no-async-promise-executor
				const { response } = await app.run( {
					request: {
						url: '/',
						cookies: { wordpress_logged_in: true },
						query: { s: 'my search' },
					},
				} );

				expect( response.redirect ).toHaveBeenCalledWith(
					'https://wordpress.com/reader/search?q=my%20search'
				);
			} );

			it( 'redirects to search when passing "q" as the query', async () => {
				// eslint-disable-next-line no-async-promise-executor
				const { response } = await app.run( {
					request: {
						url: '/',
						cookies: { wordpress_logged_in: true },
						query: { q: 'my search' },
					},
				} );

				expect( response.redirect ).toHaveBeenCalledWith(
					'https://wordpress.com/reader/search?q=my%20search'
				);
			} );

			it( 'redirects to legacy email verification when passing "newuseremail" as the query', async () => {
				// eslint-disable-next-line no-async-promise-executor
				const { response } = await app.run( {
					request: {
						url: '/',
						cookies: { wordpress_logged_in: true },
						query: { newuseremail: 'any value' },
					},
				} );

				expect( response.redirect ).toHaveBeenCalledWith(
					'https://wordpress.com/verify-email/?newuseremail=any%20value'
				);
			} );

			it( 'redirects to legacy accept invite when passing "wpcom-invite-users" in the query', async () => {
				// eslint-disable-next-line no-async-promise-executor
				const { response } = await app.run( {
					request: {
						url: '/',
						cookies: { wordpress_logged_in: true },
						query: { action: 'wpcom-invite-users' },
					},
				} );

				expect( response.redirect ).toHaveBeenCalledWith(
					'https://wordpress.com/accept-invite/?action=wpcom-invite-users'
				);
			} );
		} );
	} );

	describe( `Route deprecated /new`, () => {
		it( 'redirects to start flow', async () => {
			const { response } = await app.run( { request: { url: '/new' } } );
			expect( response.redirect ).toHaveBeenCalledWith( 301, '/start' );
		} );

		it( 'redirects to start flow with locale', async () => {
			const { response } = await app.run( { request: { url: '/new/fr' } } );
			expect( response.redirect ).toHaveBeenCalledWith( 301, '/start/fr' );
		} );
	} );

	describe( 'Route /start/domain-transfer', () => {
		it( 'redirects to /setup/domain-transfer', async () => {
			const { response } = await app.run( { request: { url: '/start/domain-transfer' } } );
			expect( response.redirect ).toHaveBeenCalledWith( 301, '/setup/domain-transfer' );
		} );
	} );

	describe( 'Route /cspreport', () => {
		let customApp;

		beforeAll( () => {
			customApp = buildApp( 'production' );
		} );

		beforeEach( () => {
			customApp.withServerRender( '' );
			customApp.withMockFilesystem();
		} );

		afterEach( () => {
			customApp.reset();
		} );

		it( 'records the event when there is a report', async () => {
			const { response, request } = await app.run( {
				request: {
					method: 'POST',
					url: '/cspreport',
					body: {
						'csp-report': {
							'document-uri': 'https://example.com/foo/bar',
							referrer: 'https://example.com/',
							'violated-directive': 'default-src self',
							'original-policy': 'default-src self; report-uri /cspreport',
							'blocked-uri': 'http://evilhackerscripts.com',
						},
					},
				},
			} );
			expect( response.statusCode ).toBe( 200 );
			expect( app.getMocks().analytics.tracks.recordEvent ).toHaveBeenCalledWith(
				'calypso_csp_report',
				{
					document_uri: 'https://example.com/foo/bar',
					referrer: 'https://example.com/',
					violated_directive: 'default-src self',
					original_policy: 'default-src self; report-uri /cspreport',
					blocked_uri: 'http://evilhackerscripts.com',
				},
				request
			);
		} );

		it( "returns an error when the report can't be parsed or sent", async () => {
			app.getMocks().analytics.tracks.recordEvent.mockImplementation( () => {
				throw new Error( 'Fake error' );
			} );
			const { response } = await app.run( { request: { method: 'POST', url: '/cspreport' } } );
			expect( response.statusCode ).toBe( 500 );
		} );
	} );

	describe( 'Route /browsehappy', () => {
		beforeEach( () => {
			app.withRenderJSX( 'content' );
		} );

		it( 'renders the content', async () => {
			const { response, request } = await app.run( { request: { url: '/browsehappy' } } );

			expect( app.getMocks().renderJsx ).toHaveBeenCalledWith( 'browsehappy', request.context );
			expect( response.send ).toHaveBeenCalledWith( 'content' );
		} );
	} );

	describe( 'Route /support-user', () => {
		beforeEach( () => {
			app.withRenderJSX( 'content' );
			app.withConfigEnabled( { 'wpcom-user-bootstrap': true } );
		} );

		it( 'disables iframe', async () => {
			const { response } = await app.run( { request: { url: '/support-user' } } );
			expect( response.setHeader ).toHaveBeenCalledWith( 'X-Frame-Options', 'DENY' );
		} );

		it( 'renders unauthorized page if wpcom-user-bootstrap is disabled', async () => {
			app.withConfigEnabled( { 'wpcom-user-bootstrap': false } );

			const { response } = await app.run( {
				request: { url: '/support-user', cookies: { wordpress_logged_in: true } },
			} );

			expect( app.getMocks().renderJsx ).toHaveBeenCalledWith( 'support-user' );
			expect( response.send ).toHaveBeenCalledWith( 'content' );
		} );

		it( 'renders unauthorized page for anonymous users', async () => {
			const { response } = await app.run( { request: { url: '/support-user' } } );

			expect( app.getMocks().renderJsx ).toHaveBeenCalledWith( 'support-user' );
			expect( response.send ).toHaveBeenCalledWith( 'content' );
		} );

		it( 'renders unauthorized page for users without flag calypso_support_user', async () => {
			app.withBootstrapUser( { meta: { data: { flags: { active_flags: [] } } } } );

			const { response } = await app.run( {
				request: { url: '/support-user', cookies: { wordpress_logged_in: true } },
			} );

			expect( app.getMocks().renderJsx ).toHaveBeenCalledWith( 'support-user' );
			expect( response.send ).toHaveBeenCalledWith( 'content' );
		} );

		it( 'renders unauthorized page if there is an error bootstrapping the user', async () => {
			app.withFailedBootstrapUser( new Error( 'fake error' ) );

			const { response } = await app.run( {
				request: { url: '/support-user', cookies: { wordpress_logged_in: true } },
			} );

			expect( app.getMocks().renderJsx ).toHaveBeenCalledWith( 'support-user' );
			expect( response.send ).toHaveBeenCalledWith( 'content' );
			expect( response.clearCookie ).toHaveBeenCalledWith( 'wordpress_logged_in', {
				path: '/',
				httpOnly: true,
				domain: '.wordpress.com',
			} );
		} );

		it( 'renders authorized page in development mode', async () => {
			const customApp = buildApp( 'development' );
			customApp.withRenderJSX( 'content' );
			customApp.withEvergreenBrowser();
			customApp.withMockFilesystem();

			const { response } = await customApp.run( {
				request: {
					url: '/support-user',
					query: {
						support_user: 'user',
						_support_token: 'token',
						support_path: 'path',
					},
				},
			} );

			expect( customApp.getMocks().renderJsx ).toHaveBeenCalledWith( 'support-user', {
				authorized: true,
				supportPath: 'path',
				supportToken: 'token',
				supportUser: 'user',
			} );
			expect( response.send ).toHaveBeenCalledWith( 'content' );
		} );

		it( 'renders authorized page for users with flag calypso_support_user', async () => {
			app.withBootstrapUser( {
				meta: { data: { flags: { active_flags: [ 'calypso_support_user' ] } } },
			} );

			const { response } = await app.run( {
				request: {
					url: '/support-user',
					cookies: { wordpress_logged_in: true },
					query: {
						support_user: 'user',
						_support_token: 'token',
						support_path: 'path',
					},
				},
			} );

			expect( app.getMocks().renderJsx ).toHaveBeenCalledWith( 'support-user', {
				authorized: true,
				supportPath: 'path',
				supportToken: 'token',
				supportUser: 'user',
			} );
			expect( response.send ).toHaveBeenCalledWith( 'content' );
		} );
	} );

	describe( '404 page', () => {
		it( 'returns a 404', async () => {
			app.withRenderJSX( 'content' );

			const { response } = await app.run( { request: { url: '/does-not-exists' } } );

			expect( response.send ).toHaveBeenCalledWith( 'content' );
			expect( response.statusCode ).toBe( 404 );
			expect( app.getMocks().renderJsx ).toHaveBeenCalledWith( '404', {
				entrypoint: {
					'css.ltr': [ '/calypso/evergreen/entry-main.3.min.css' ],
					'css.rtl': [ '/calypso/evergreen/entry-main.4.min.rtl.css' ],
					js: [
						'/calypso/evergreen/entry-main.1.min.js',
						'/calypso/evergreen/entry-main.2.min.js',
					],
				},
			} );
		} );
	} );

	describe( 'Error page', () => {
		const forceError = () => {
			// response.redirect throwing is very unlikely, but it offers the best
			// place to simulate an error in the current implementation of the app
			return app.run( {
				response: {
					redirect: jest.fn( () => {
						throw { error: 'fake error' };
					} ),
				},
			} );
		};

		beforeEach( () => {
			app.withConfigEnabled( {
				'wpcom-user-bootstrap': true,
				'use-translation-chunks': true,
				reader: false,
				stats: true,
			} );
			app.withRenderJSX( 'content' );
			app.withUrl( '/' );

			jest.spyOn( console, 'error' ).mockImplementation( () => {} );
		} );

		it( 'returns a 500', async () => {
			const { response } = await forceError();

			expect( response.send ).toHaveBeenCalledWith( 'content' );
			expect( response.statusCode ).toBe( 500 );
			expect( app.getMocks().renderJsx ).toHaveBeenCalledWith( '500', {
				entrypoint: {
					'css.ltr': [ '/calypso/evergreen/entry-main.3.min.css' ],
					'css.rtl': [ '/calypso/evergreen/entry-main.4.min.rtl.css' ],
					js: [
						'/calypso/evergreen/entry-main.1.min.js',
						'/calypso/evergreen/entry-main.2.min.js',
					],
				},
			} );
		} );

		it( 'logs the error in development mode', async () => {
			const { request } = await forceError();

			expect( request.logger.error ).toHaveBeenCalledWith( { error: 'fake error' } );
		} );
	} );
} );
