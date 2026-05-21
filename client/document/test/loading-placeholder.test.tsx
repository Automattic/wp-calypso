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
