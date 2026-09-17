/**
 * @jest-environment jsdom
 */
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import redirectPathIfNecessary, { isRemovedFlow } from '../flow-redirect-handler';

jest.mock( 'calypso/lib/analytics/tracks', () => ( {
	recordTracksEvent: jest.fn(),
} ) );

describe( 'flow redirect handler', () => {
	const replace = jest.fn();

	beforeEach( () => {
		jest.clearAllMocks();
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

	it( 'does not classify existing AI Site Builder sites as removed', () => {
		expect( isRemovedFlow( 'ai-site-builder' ) ).toBe( false );
	} );
} );
