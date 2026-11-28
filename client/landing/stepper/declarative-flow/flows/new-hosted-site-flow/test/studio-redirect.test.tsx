/**
 * @jest-environment jsdom
 */
import { waitFor } from '@testing-library/react';
import { ProcessingResult } from '../../../internals/steps-repository/processing-step/constants';
import { renderFlow } from '../../../test/helpers';
import newHostedSiteFlow from '../new-hosted-site-flow';

it( 'sends Studio users through checkout and the transfer wait to the wp-admin Dashboard', async () => {
	Object.defineProperty( window, 'location', {
		configurable: true,
		value: { ...window.location, assign: jest.fn() },
	} );

	renderFlow( newHostedSiteFlow ).runUseStepNavigationSubmit( {
		currentURL: '/setup/new-hosted-site/processing?studioSiteId=abc&autoOpenPush=true',
		currentStep: 'processing',
		dependencies: {
			processingResult: ProcessingResult.SUCCESS,
			siteId: 123,
			siteSlug: 'example.wordpress.com',
			goToCheckout: true,
		},
	} );

	await waitFor( () => expect( window.location.assign ).toHaveBeenCalled() );
	const checkout = new URL(
		jest.mocked( window.location.assign ).mock.calls[ 0 ][ 0 ],
		'https://x'
	);
	const transfer = new URL( checkout.searchParams.get( 'redirect_to' ) ?? '', 'https://x' );
	expect( transfer.searchParams.get( 'redirect_to' ) ).toBe(
		'https://example.wordpress.com/wp-admin/?studioSiteId=abc&autoOpenPush=true'
	);
} );
