/**
 * @jest-environment jsdom
 */
import { isEnabled } from '@automattic/calypso-config';
import { STEPS } from 'calypso/landing/stepper/declarative-flow/internals/steps';
import { SESSION_KEY_FROM_PLAYGROUND_PUBLISH } from 'calypso/landing/stepper/declarative-flow/internals/steps-repository/playground/lib/constants';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import redirectPathIfNecessary, { isRemovedFlow } from '../flow-redirect-handler';

// `@automattic/calypso-products` calls `isEnabled` while it loads, before a top-level
// `mockIsEnabled` would exist, so the mock is created inside the factory.
jest.mock( '@automattic/calypso-config', () =>
	Object.assign( jest.fn(), { isEnabled: jest.fn( () => false ) } )
);
const mockIsEnabled = isEnabled as jest.Mock;

jest.mock( 'calypso/lib/analytics/tracks', () => ( {
	recordTracksEvent: jest.fn(),
} ) );

describe( 'flow redirect handler', () => {
	const replace = jest.fn();

	beforeEach( () => {
		jest.clearAllMocks();
		mockIsEnabled.mockReturnValue( false );
		window.sessionStorage.clear();
		Object.defineProperty( window, 'location', {
			value: { href: '', replace },
			writable: true,
		} );
	} );

	it( 'redirects the retired AI Site Builder flow to paid onboarding', () => {
		const didRedirect = redirectPathIfNecessary(
			'/setup/ai-site-builder',
			'?prompt=Build+a+bakery&source=landing-page&ref=hero'
		);

		expect( didRedirect ).toBe( true );
		expect( replace ).toHaveBeenCalledWith(
			'/setup/ai-site-builder-onboarding?prompt=Build+a+bakery&source=landing-page&ref=hero'
		);
		expect( recordTracksEvent ).toHaveBeenCalledWith( 'calypso_ai_site_builder_legacy_redirect', {
			from_flow: 'ai-site-builder',
			to_flow: 'ai-site-builder-onboarding',
			legacy_step: 'initial',
			ref: 'hero',
			source: 'landing-page',
			has_prompt: true,
			has_spec_id: false,
			has_create_garden_site: false,
		} );
	} );

	it( 'redirects stale spec and garden entry points while classifying them for tracking', () => {
		redirectPathIfNecessary(
			'/setup/ai-site-builder/create-site',
			'?spec_id=spec-123&create_garden_site=1&provision_target=wpcom-atomic'
		);

		expect( replace ).toHaveBeenCalledWith(
			'/setup/ai-site-builder-onboarding?spec_id=spec-123&create_garden_site=1&provision_target=wpcom-atomic'
		);
		expect( recordTracksEvent ).toHaveBeenCalledWith( 'calypso_ai_site_builder_legacy_redirect', {
			from_flow: 'ai-site-builder',
			to_flow: 'ai-site-builder-onboarding',
			legacy_step: 'create-site',
			has_prompt: false,
			has_spec_id: true,
			has_create_garden_site: true,
			provision_target: 'wpcom-atomic',
		} );
	} );

	it.each( [
		[
			'domains with a site id',
			'/setup/ai-site-builder/domains',
			'?siteId=123&redirect=site-launch',
		],
		[ 'plans with a site id', '/setup/ai-site-builder/plans', '?siteId=123&redirect=site-launch' ],
		[
			'plans with a site slug',
			'/setup/ai-site-builder/plans',
			'?siteSlug=example.wordpress.com&redirect=site-launch',
		],
	] )( 'preserves the existing-site upgrade path through %s', ( _label, pathname, search ) => {
		const didRedirect = redirectPathIfNecessary( pathname, search );

		expect( didRedirect ).toBe( false );
		expect( replace ).not.toHaveBeenCalled();
		expect( recordTracksEvent ).not.toHaveBeenCalled();
	} );

	it( 'does not match the separate AI Site Builder Spec flow', () => {
		const didRedirect = redirectPathIfNecessary(
			'/setup/ai-site-builder-spec/site-spec',
			'?build_wow=1&siteId=123'
		);

		expect( didRedirect ).toBe( false );
		expect( replace ).not.toHaveBeenCalled();
		expect( recordTracksEvent ).not.toHaveBeenCalled();
	} );

	it.each( [
		[
			'?siteId=123&siteSlug=example.wordpress.com',
			'/home/123?siteId=123&siteSlug=example.wordpress.com',
		],
		[
			'?siteSlug=example.wordpress.com',
			'/home/example.wordpress.com?siteSlug=example.wordpress.com',
		],
		[ '', '/home' ],
	] )( 'sends readymade-template links with %p to that site’s Home', ( search, expected ) => {
		redirectPathIfNecessary( '/setup/readymade-template/launchpad', search );

		expect( window.location.href ).toBe( expected );
	} );

	it( 'sends blog sites’ Launchpad to the build flow without treating write as removed', () => {
		redirectPathIfNecessary( '/setup/write/launchpad', '?siteSlug=example.wordpress.com' );

		expect( replace ).toHaveBeenCalledWith(
			'/setup/build/launchpad?siteSlug=example.wordpress.com'
		);
		// My Home skips the Launchpad for sites whose intent is a removed flow.
		expect( isRemovedFlow( 'write' ) ).toBe( false );
	} );

	it( 'keeps a write link’s locale, including ones outside the shared pattern', () => {
		redirectPathIfNecessary( '/setup/write/launchpad/sr_latin', '?siteSlug=example.wordpress.com' );

		expect( replace ).toHaveBeenCalledWith(
			'/setup/build/launchpad/sr_latin?siteSlug=example.wordpress.com'
		);
	} );

	it( 'does not classify existing AI Site Builder sites as removed', () => {
		expect( isRemovedFlow( 'ai-site-builder' ) ).toBe( false );
	} );

	describe( 'entrepreneur flow', () => {
		beforeEach( () => {
			mockIsEnabled.mockImplementation(
				( flag: string ) => flag === 'entrepreneur/redirect-to-commerce-purchase'
			);
		} );

		it( 'sends a survey visit to the Commerce purchase path, keeping the query and replacing plan', () => {
			const didRedirect = redirectPathIfNecessary(
				'/setup/entrepreneur/start',
				'?ref=partner&utm_source=ads&plan=personal-bundle'
			);

			expect( didRedirect ).toBe( true );
			expect( replace ).toHaveBeenCalledWith(
				'/setup/new-hosted-site?ref=partner&utm_source=ads&plan=ecommerce-bundle'
			);
			expect( recordTracksEvent ).toHaveBeenCalledWith(
				'calypso_tailored_flows_redirect',
				expect.objectContaining( {
					redirect_to_url:
						'/setup/new-hosted-site?ref=partner&utm_source=ads&plan=ecommerce-bundle',
				} )
			);
		} );

		it.each( [
			'/setup/entrepreneur',
			'/setup/entrepreneur/user',
			`/setup/entrepreneur/${ STEPS.TRIAL_ACKNOWLEDGE.slug }`,
			`/setup/entrepreneur/${ STEPS.SITE_CREATION_STEP.slug }`,
		] )( 'redirects %s before site creation', ( pathname ) => {
			redirectPathIfNecessary( pathname, '' );

			expect( replace ).toHaveBeenCalledWith( '/setup/new-hosted-site?plan=ecommerce-bundle' );
		} );

		it.each( [
			[ '/setup/entrepreneur/start/es', '/setup/new-hosted-site/es?plan=ecommerce-bundle' ],
			[ '/setup/entrepreneur/es', '/setup/new-hosted-site/es?plan=ecommerce-bundle' ],
			[
				'/setup/entrepreneur/start/sr_latin',
				'/setup/new-hosted-site/sr_latin?plan=ecommerce-bundle',
			],
		] )( 'keeps the locale when redirecting %s', ( pathname, expected ) => {
			redirectPathIfNecessary( pathname, '' );

			expect( replace ).toHaveBeenCalledWith( expected );
		} );

		it.each( [
			STEPS.PROCESSING.slug,
			STEPS.WAIT_FOR_ATOMIC.slug,
			STEPS.WAIT_FOR_PLUGIN_INSTALL.slug,
			STEPS.IMPORTER_PLAYGROUND.slug,
			STEPS.ERROR.slug,
		] )( 'lets a trial already being set up finish on the %s step', ( step ) => {
			const didRedirect = redirectPathIfNecessary( `/setup/entrepreneur/${ step }`, '?siteId=123' );

			expect( didRedirect ).toBe( false );
			expect( replace ).not.toHaveBeenCalled();
		} );

		it( 'lets a trial already being set up finish on a localized step', () => {
			const didRedirect = redirectPathIfNecessary(
				`/setup/entrepreneur/${ STEPS.WAIT_FOR_ATOMIC.slug }/es`,
				'?siteId=123'
			);

			expect( didRedirect ).toBe( false );
			expect( replace ).not.toHaveBeenCalled();
		} );

		it( 'leaves the Woo Playground test path on the trial', () => {
			const didRedirect = redirectPathIfNecessary(
				'/setup/entrepreneur',
				'?from=playground-publish'
			);

			expect( didRedirect ).toBe( false );
			expect( replace ).not.toHaveBeenCalled();
		} );

		it( 'leaves the Playground path on the trial after the login round trip drops the query', () => {
			window.sessionStorage.setItem( SESSION_KEY_FROM_PLAYGROUND_PUBLISH, '1' );

			const didRedirect = redirectPathIfNecessary( '/setup/entrepreneur/create-site', '' );

			expect( didRedirect ).toBe( false );
			expect( replace ).not.toHaveBeenCalled();
		} );

		it( 'does not redirect while the feature flag is off', () => {
			mockIsEnabled.mockReturnValue( false );

			const didRedirect = redirectPathIfNecessary( '/setup/entrepreneur/start', '' );

			expect( didRedirect ).toBe( false );
			expect( replace ).not.toHaveBeenCalled();
		} );

		it( 'does not classify the entrepreneur flow as removed', () => {
			expect( isRemovedFlow( 'entrepreneur' ) ).toBe( false );
		} );
	} );
} );
