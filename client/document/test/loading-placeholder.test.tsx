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
	devDocs: false,
	devDocsURL: '',
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
	storeSandboxHelper: false,
	target: 'evergreen',
	user: null,
	useTranslationChunks: false,
	showStepContainerV2Loader: true,
};

describe( 'Document LoadingPlaceholder', () => {
	it( 'hides the WordPress logo for Woo Hosted plans setup SSR', () => {
		const html = renderToStaticMarkup(
			<Document
				{ ...baseProps }
				path="/setup/woo-hosted-plans/plans?siteSlug=unabashedly-instant-starlight.commerce-garden.com&dashboard=ciab&sessionId=Z0"
				sectionName="stepper"
			/>
		);

		expect( html ).not.toContain( 'step-container-v2__top-bar-wordpress-logo-wrapper' );
	} );

	it( 'hides the WordPress logo for Woo Hosted checkout SSR', () => {
		const html = renderToStaticMarkup(
			<Document
				{ ...baseProps }
				path="/checkout/unabashedly-instant-starlight.commerce-garden.com?redirect_to=https%3A%2F%2Fmy.wordpress.com%2Fciab%2Fsites&cancel_to=%2Fsetup%2Fwoo-hosted-plans%2Fplans%3FsiteSlug%3Dunabashedly-instant-starlight.commerce-garden.com%26dashboard%3Dciab%26sessionId%3DZ0"
				sectionName="checkout"
			/>
		);

		expect( html ).not.toContain( 'step-container-v2__top-bar-wordpress-logo-wrapper' );
	} );

	it( 'shows the WordPress logo when only Woo Hosted siteSlug is present', () => {
		const html = renderToStaticMarkup(
			<Document
				{ ...baseProps }
				query={ {
					siteSlug: 'unabashedly-instant-starlight.commerce-garden.com',
					dashboard: 'ciab',
					sessionId: 'Z0',
				} }
				sectionName="stepper"
			/>
		);

		expect( html ).toContain( 'step-container-v2__top-bar-wordpress-logo-wrapper' );
	} );
} );
