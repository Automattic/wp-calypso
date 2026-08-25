/**
 * @jest-environment jsdom
 * @jest-environment-options { "url": "https://my.localhost/" }
 */

import { disable, enable } from '@automattic/calypso-config';
import { screen, waitFor } from '@testing-library/react';
import { render } from '../../../test-utils';
import { FREE_DOMAIN_UPSELL_EXPERIMENT } from '../../free-domain-upsell';
import { OmnibarFreeDomainChip } from '../omnibar-free-domain-chip';
import type { Site } from '@automattic/api-core';

const FREE_SIMPLE_SITE = {
	ID: 123,
	slug: 'test-site.wordpress.com',
	plan: { is_free: true },
	jetpack: false,
	is_wpcom_atomic: false,
	is_garden: false,
	is_wpcom_staging_site: false,
} as Site;

const PAID_SITE = {
	...FREE_SIMPLE_SITE,
	plan: { is_free: false },
} as Site;

// Seed a live assignment into the storage ExPlat reads from, so the real
// `useExperiment` hook resolves to the given variation through its normal code
// path — no network call, no mocking.
function assignExperiment( variationName: string | null = null ) {
	window.localStorage.setItem(
		`explat-experiment--${ FREE_DOMAIN_UPSELL_EXPERIMENT }`,
		JSON.stringify( {
			experimentName: FREE_DOMAIN_UPSELL_EXPERIMENT,
			variationName,
			retrievedTimestamp: Date.now(),
			ttl: 3600,
		} )
	);
}

describe( '<OmnibarFreeDomainChip>', () => {
	beforeEach( () => {
		enable( 'dashboard/omnibar-free-domain-chip' );
	} );

	afterEach( () => {
		window.localStorage.clear();
		window.history.replaceState( {}, '', '/' );
		disable( 'dashboard/omnibar-free-domain-chip' );
	} );

	test( 'shows the chip for an eligible site in the treatment group', async () => {
		assignExperiment( 'treatment' );

		render( <OmnibarFreeDomainChip site={ FREE_SIMPLE_SITE } /> );

		const link = await screen.findByRole( 'link', { name: 'Free domain' } );
		expect( link ).toBeVisible();
		expect( link ).toHaveAttribute(
			'href',
			expect.stringContaining( '/setup/domain-and-plan?siteSlug=test-site.wordpress.com' )
		);
	} );

	test( 'does not show the chip for an eligible site in the control group', async () => {
		assignExperiment( null );

		render( <OmnibarFreeDomainChip site={ FREE_SIMPLE_SITE } /> );

		await waitFor( () => {
			expect( screen.queryByRole( 'link', { name: 'Free domain' } ) ).not.toBeInTheDocument();
		} );
	} );

	test( 'does not show the chip for a paid site, even in the treatment group', async () => {
		assignExperiment( 'treatment' );

		render( <OmnibarFreeDomainChip site={ PAID_SITE } /> );

		await waitFor( () => {
			expect( screen.queryByRole( 'link', { name: 'Free domain' } ) ).not.toBeInTheDocument();
		} );
	} );

	test( 'does not show the chip when the feature flag is off, even in the treatment group', async () => {
		disable( 'dashboard/omnibar-free-domain-chip' );
		assignExperiment( 'treatment' );

		render( <OmnibarFreeDomainChip site={ FREE_SIMPLE_SITE } /> );

		await waitFor( () => {
			expect( screen.queryByRole( 'link', { name: 'Free domain' } ) ).not.toBeInTheDocument();
		} );
	} );

	test( 'the omnibar_free_domain query param forces the chip on, overriding the assignment', async () => {
		assignExperiment( null );
		window.history.replaceState( {}, '', '/?omnibar_free_domain=1' );

		render( <OmnibarFreeDomainChip site={ FREE_SIMPLE_SITE } /> );

		expect( await screen.findByRole( 'link', { name: 'Free domain' } ) ).toBeVisible();
	} );
} );
