/** @jest-environment jsdom */
jest.mock( 'calypso/components/data/query-site-settings', () => () => null );
jest.mock( 'calypso/components/data/query-jetpack-modules', () => () => null );
jest.mock( 'calypso/my-sites/site-settings/jetpack-module-toggle', () => () => null );
jest.mock( 'calypso/components/support-info', () => () => null );
jest.mock( 'calypso/components/inline-support-link', () => () => null );

import { render } from '@testing-library/react';
import { SiteVerification } from '../site-verification';

const noop = () => {};

const baseProps = {
	translate: ( x ) => x,
	markChanged: noop,
	markSaved: noop,
	errorNotice: noop,
	removeNotice: noop,
	requestSite: noop,
	requestSiteSettings: noop,
	saveSiteSettings: noop,
	trackSiteVerificationUpdated: noop,
	trackFormSubmitted: noop,
	site: { ID: 1 },
	siteId: 1,
	siteIsJetpack: false,
	isSaveSuccess: false,
	saveError: false,
	siteSettings: null,
	path: '/settings/traffic/1',
};

function getInput( container, slug ) {
	return container.querySelector( `[name="verification_code_${ slug }"]` );
}

describe( 'SiteVerification', () => {
	test( 'renders form inputs for all supported services', () => {
		const { container } = render( <SiteVerification { ...baseProps } /> );
		expect( getInput( container, 'google' ) ).toBeInTheDocument();
		expect( getInput( container, 'bing' ) ).toBeInTheDocument();
		expect( getInput( container, 'pinterest' ) ).toBeInTheDocument();
		expect( getInput( container, 'yandex' ) ).toBeInTheDocument();
	} );

	test( 'populates fields from siteSettings.verification_services_codes', () => {
		const siteSettings = {
			verification_services_codes: {
				google: '<meta name="google-site-verification" content="abc123" />',
				bing: '<meta name="msvalidate.01" content="def456" />',
				pinterest: '',
				yandex: '',
				facebook: '',
			},
		};

		const { container } = render(
			<SiteVerification { ...baseProps } siteSettings={ siteSettings } />
		);

		expect( getInput( container, 'google' ) ).toHaveValue(
			'<meta name="google-site-verification" content="abc123" />'
		);
		expect( getInput( container, 'bing' ) ).toHaveValue(
			'<meta name="msvalidate.01" content="def456" />'
		);
		expect( getInput( container, 'pinterest' ) ).toHaveValue( '' );
	} );

	test( 'falls back to site.options.verification_services_codes when siteSettings is null', () => {
		const site = {
			ID: 1,
			options: {
				verification_services_codes: {
					google: '<meta name="google-site-verification" content="fromsite" />',
					bing: '',
					pinterest: '',
					yandex: '',
					facebook: '',
				},
			},
		};

		const { container } = render(
			<SiteVerification { ...baseProps } site={ site } siteSettings={ null } />
		);

		expect( getInput( container, 'google' ) ).toHaveValue(
			'<meta name="google-site-verification" content="fromsite" />'
		);
		expect( getInput( container, 'bing' ) ).toHaveValue( '' );
	} );

	test( 'siteSettings takes precedence over site.options when both are present', () => {
		const site = {
			ID: 1,
			options: {
				verification_services_codes: {
					google: '<meta name="google-site-verification" content="fromsite" />',
				},
			},
		};
		const siteSettings = {
			verification_services_codes: {
				google: '<meta name="google-site-verification" content="fromsettings" />',
				bing: '',
				pinterest: '',
				yandex: '',
				facebook: '',
			},
		};

		const { container } = render(
			<SiteVerification { ...baseProps } site={ site } siteSettings={ siteSettings } />
		);

		expect( getInput( container, 'google' ) ).toHaveValue(
			'<meta name="google-site-verification" content="fromsettings" />'
		);
	} );

	test( 'renders empty fields when both siteSettings and site.options have no codes', () => {
		const { container } = render( <SiteVerification { ...baseProps } /> );

		expect( getInput( container, 'google' ) ).toHaveValue( '' );
		expect( getInput( container, 'bing' ) ).toHaveValue( '' );
	} );
} );
