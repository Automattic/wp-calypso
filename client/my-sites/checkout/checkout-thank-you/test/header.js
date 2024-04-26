/** @jest-environment jsdom */
import { render, screen } from '@testing-library/react';
import { CheckoutThankYouHeader } from '../header';

jest.unmock( '@automattic/calypso-products' );
jest.mock( '@automattic/calypso-products', () => ( {
	...jest.requireActual( '@automattic/calypso-products' ),
	shouldFetchSitePlans: () => false,
	isDotComPlan: jest.fn( () => false ),
} ) );

jest.mock( 'calypso/lib/analytics/tracks', () => ( {
	recordTracksEvent: () => null,
} ) );
jest.mock( 'calypso/lib/analytics/page-view-tracker', () => 'PageViewTracker' );
jest.mock( 'calypso/components/happiness-support', () => 'HappinessSupport' );

const translate = ( x ) => x;

describe( 'CheckoutThankYouHeader', () => {
	const defaultProps = {
		translate,
		primaryPurchase: {
			product_slug: 'business-bundle',
		},
		recordTracksEvent: () => {},
		recordStartTransferClickInThankYou: () => {},
		titanAppsUrlPrefix: '',
	};
	describe( 'Basic tests', () => {
		test( "Should display a loading indicator while data isn't loaded yet", () => {
			render( <CheckoutThankYouHeader isDataLoaded={ false } { ...defaultProps } /> );
			expect( screen.getByRole( 'heading', { level: 1 } ) ).toHaveTextContent( 'Loading…' );
		} );
	} );
} );
