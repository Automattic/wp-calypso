/**
 * @jest-environment jsdom
 */
import { waitFor } from '@testing-library/react';
import { ProcessingResult } from '../../../internals/steps-repository/processing-step/constants';
import { renderFlow } from '../../../test/helpers';
import newHostedSiteFlow from '../new-hosted-site-flow';

const originalLocation = window.location;

const getStudioLanding = () => {
	const checkoutUrl = new URL(
		( window.location.assign as jest.Mock ).mock.calls[ 0 ][ 0 ],
		'https://wordpress.com'
	);
	const transferringUrl = new URL(
		checkoutUrl.searchParams.get( 'redirect_to' ) ?? '',
		'https://wordpress.com'
	);
	return {
		checkoutUrl,
		transferringUrl,
		landing: transferringUrl.searchParams.get( 'redirect_to' ),
	};
};

describe( 'new-hosted-site flow: the Studio handoff destination', () => {
	const { runUseStepNavigationSubmit } = renderFlow( newHostedSiteFlow );

	const submitProcessing = ( search: string ) =>
		runUseStepNavigationSubmit( {
			currentURL: `/setup/new-hosted-site/processing${ search }`,
			currentStep: 'processing',
			dependencies: {
				processingResult: ProcessingResult.SUCCESS,
				siteId: 123,
				siteSlug: 'example.wordpress.com',
				goToCheckout: true,
			},
		} );

	beforeEach( () => {
		Object.defineProperty( window, 'location', {
			configurable: true,
			value: { ...originalLocation, assign: jest.fn(), replace: jest.fn() },
		} );
	} );

	afterAll( () => {
		Object.defineProperty( window, 'location', { configurable: true, value: originalLocation } );
	} );

	it( 'sends Studio users through checkout and the transfer wait to the wp-admin Dashboard', async () => {
		submitProcessing( '?studioSiteId=abc&autoOpenPush=true' );

		await waitFor( () => expect( window.location.assign ).toHaveBeenCalled() );

		const { checkoutUrl, transferringUrl, landing } = getStudioLanding();
		expect( checkoutUrl.pathname ).toBe( '/checkout/example.wordpress.com' );
		expect( transferringUrl.pathname ).toBe( '/setup/transferring-hosted-site' );
		expect( landing ).toBe(
			'https://example.wordpress.com/wp-admin/?studioSiteId=abc&autoOpenPush=true'
		);
	} );

	// Checkout runs its own Studio round trip when its URL carries `studioSiteId`.
	it( 'keeps studioSiteId out of the checkout URL itself', async () => {
		submitProcessing( '?studioSiteId=abc' );

		await waitFor( () => expect( window.location.assign ).toHaveBeenCalled() );

		expect( getStudioLanding().checkoutUrl.searchParams.has( 'studioSiteId' ) ).toBe( false );
	} );

	it( 'leaves autoOpenPush off the Dashboard URL when Studio did not ask for it', async () => {
		submitProcessing( '?studioSiteId=abc' );

		await waitFor( () => expect( window.location.assign ).toHaveBeenCalled() );

		expect( getStudioLanding().landing ).toBe(
			'https://example.wordpress.com/wp-admin/?studioSiteId=abc'
		);
	} );

	it( 'adds no Studio destination without studioSiteId', async () => {
		submitProcessing( '' );

		await waitFor( () => expect( window.location.assign ).toHaveBeenCalled() );

		expect( getStudioLanding().landing ).toBeNull();
	} );
} );
