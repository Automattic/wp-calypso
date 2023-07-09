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
jest.mock( '../domain-registration-details', () => 'component--domain-registration-details' );
jest.mock( '../google-apps-details', () => 'component--google-apps-details' );
jest.mock( '../jetpack-plan-details', () => 'component--jetpack-plan-details' );
jest.mock( '../atomic-store-thank-you-card', () => 'component--AtomicStoreThankYouCard' );
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

		test( 'Should display getText()-based success message when isSimplified=false (default)', () => {
			render( <CheckoutThankYouHeader isDataLoaded={ true } { ...defaultProps } /> );
			expect( screen.getByRole( 'heading', { level: 1 } ) ).toHaveTextContent(
				'Get the best out of your site'
			);
			expect( screen.getByRole( 'heading', { level: 2 } ) ).toHaveTextContent(
				'All set! Start exploring the features included with your {{strong}}%(productName)s{{/strong}} plan'
			);
		} );
		test( 'Should display an alternative success message when isSimplified=true', () => {
			render(
				<CheckoutThankYouHeader isDataLoaded={ true } isSimplified={ true } { ...defaultProps } />
			);
			expect( screen.getByRole( 'heading', { level: 1 } ) ).toHaveTextContent(
				'Get the best out of your site'
			);
			expect( screen.getByRole( 'heading', { level: 2 } ) ).toHaveTextContent(
				'All set! Start exploring the features included with your {{strong}}%(productName)s{{/strong}} plan'
			);
		} );
		test( 'Should display a list of success messages when siteUnlaunchedBeforeUpgrade=true', () => {
			render(
				<CheckoutThankYouHeader
					isDataLoaded={ true }
					isSimplified={ true }
					siteUnlaunchedBeforeUpgrade={ true }
					{ ...defaultProps }
				/>
			);
			expect( screen.getByRole( 'heading', { level: 1 } ) ).toHaveTextContent(
				'Get the best out of your site'
			);
			expect( screen.queryByRole( 'heading', { level: 2 } ) ).not.toBeInTheDocument();

			const messages = screen.queryAllByRole( 'listitem' );

			expect( messages ).toHaveLength( 2 );
			expect( messages[ 0 ] ).toHaveTextContent(
				'All set! Start exploring the features included with your {{strong}}%(productName)s{{/strong}} plan'
			);
			expect( messages[ 1 ] ).toHaveTextContent(
				"Your site has been launched. You can share it with the world whenever you're ready."
			);
		} );
	} );
} );
