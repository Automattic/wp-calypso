/**
 * @jest-environment jsdom
 */

import { renderToStaticMarkup } from 'react-dom/server';
import Document from '../index';
import type { ComponentProps } from 'react';

type DocumentProps = ComponentProps< typeof Document >;

const baseProps: DocumentProps = {
	accountSettingsHelper: false,
	app: {},
	authHelper: false,
	badge: false,
	branchName: '',
	buildTimestamp: '',
	chunkFiles: {
		js: [],
		'css.ltr': [],
		'css.rtl': [],
	},
	clientData: null,
	commitChecksum: '',
	commitSha: '',
	entrypoint: {
		js: [],
		'css.ltr': [],
		'css.rtl': [],
		language: { translations: [] },
	},
	env: 'development',
	featuresHelper: false,
	feedbackURL: '',
	head: { title: 'Test', metas: [], links: [] },
	i18nLocaleScript: '',
	initialQueryState: null,
	initialReduxState: null,
	inlineScriptNonce: 'nonce',
	isSupportSession: false,
	isSSP: false,
	lang: 'en',
	languageRevisions: null,
	manifests: [],
	params: {},
	preferencesHelper: false,
	query: {},
	reactQueryDevtoolsHelper: false,
	renderedLayout: null,
	sectionGroup: '',
	sectionName: 'stepper',
	path: '/',
	storeSandboxHelper: false,
	target: 'evergreen',
	user: null,
	useTranslationChunks: false,
	showStepContainerV2Loader: true,
};

describe( 'Document LoadingPlaceholder', () => {
	it( 'hides the WordPress logo on CIAB dashboard', () => {
		const html = renderToStaticMarkup(
			<Document { ...baseProps } dashboard="ciab" sectionName="stepper" />
		);

		expect( html ).not.toContain( 'step-container-v2__top-bar-wordpress-logo-wrapper' );
	} );

	it( 'shows the WordPress logo on non-CIAB dashboard', () => {
		const html = renderToStaticMarkup( <Document { ...baseProps } sectionName="stepper" /> );

		expect( html ).toContain( 'step-container-v2__top-bar-wordpress-logo-wrapper' );
	} );

	it( 'hides the WordPress boot logo on the WooCommerce QR login auth-check route', () => {
		const html = renderToStaticMarkup(
			<Document
				{ ...baseProps }
				path="/me/security/qr-login"
				query={ { origin: 'woocommerce' } }
				sectionName="me"
				showStepContainerV2Loader={ false }
			/>
		);

		expect( html ).not.toContain( 'wpcom-site__logo' );
		expect( html ).toContain( 'wpcom-loading__boot' );
	} );
} );

describe( 'Document RTL CSS handling', () => {
	const originalBuildRtlCss = process.env.BUILD_RTL_CSS;

	afterEach( () => {
		if ( originalBuildRtlCss === undefined ) {
			delete process.env.BUILD_RTL_CSS;
			return;
		}

		process.env.BUILD_RTL_CSS = originalBuildRtlCss;
	} );

	it( 'shows the RTL CSS disabled badge and uses LTR styles in RTL dev mode', () => {
		delete process.env.BUILD_RTL_CSS;

		const html = renderToStaticMarkup(
			<Document
				{ ...baseProps }
				badge="dev"
				feedbackURL="https://github.com/Automattic/wp-calypso/issues/"
				lang="ar"
				entrypoint={ {
					...baseProps.entrypoint,
					'css.ltr': [ '/calypso/evergreen/entry-main.css' ],
					'css.rtl': [ '/calypso/evergreen/entry-main.rtl.css' ],
				} }
			/>
		);

		expect( html ).toContain( 'var RTL_CSS_ENABLED = false' );
		expect( html ).toContain( 'RTLCSS off: set BUILD_RTL_CSS=true' );
		expect( html ).toContain( '/calypso/evergreen/entry-main.css' );
		expect( html ).not.toContain( '/calypso/evergreen/entry-main.rtl.css' );
	} );

	it( 'uses RTL styles and hides the badge when BUILD_RTL_CSS is true', () => {
		process.env.BUILD_RTL_CSS = 'true';

		const html = renderToStaticMarkup(
			<Document
				{ ...baseProps }
				badge="dev"
				feedbackURL="https://github.com/Automattic/wp-calypso/issues/"
				lang="ar"
				entrypoint={ {
					...baseProps.entrypoint,
					'css.ltr': [ '/calypso/evergreen/entry-main.css' ],
					'css.rtl': [ '/calypso/evergreen/entry-main.rtl.css' ],
				} }
			/>
		);

		expect( html ).toContain( 'var RTL_CSS_ENABLED = true' );
		expect( html ).not.toContain( 'RTLCSS off: set BUILD_RTL_CSS=true' );
		expect( html ).not.toContain( '/calypso/evergreen/entry-main.css' );
		expect( html ).toContain( '/calypso/evergreen/entry-main.rtl.css' );
	} );

	it( 'renders the helper in LTR dev mode so it can appear after a runtime RTL switch', () => {
		delete process.env.BUILD_RTL_CSS;

		const html = renderToStaticMarkup(
			<Document
				{ ...baseProps }
				badge="dev"
				feedbackURL="https://github.com/Automattic/wp-calypso/issues/"
			/>
		);

		expect( html ).toContain( 'var RTL_CSS_ENABLED = false' );
		expect( html ).toContain( 'RTLCSS off: set BUILD_RTL_CSS=true' );
	} );
} );
