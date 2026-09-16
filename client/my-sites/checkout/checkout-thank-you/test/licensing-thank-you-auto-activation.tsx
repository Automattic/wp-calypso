/**
 * @jest-environment jsdom
 */

import { screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { requestUpdateJetpackCheckoutSupportTicket } from 'calypso/state/jetpack-checkout/actions';
import jetpackCheckout from 'calypso/state/jetpack-checkout/reducer';
import productsList from 'calypso/state/products-list/reducer';
import getJetpackSites from 'calypso/state/selectors/get-jetpack-sites';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import LicensingThankYouAutoActivation from '../licensing-thank-you-auto-activation';

jest.mock( 'calypso/components/data/query-products-list', () => () => null );
jest.mock( 'calypso/lib/analytics/page-view-tracker', () => () => null );

jest.mock( 'calypso/state/selectors/get-jetpack-sites', () => ( {
	__esModule: true,
	default: jest.fn(),
} ) );

jest.mock( 'calypso/state/jetpack-checkout/actions', () => ( {
	requestUpdateJetpackCheckoutSupportTicket: jest.fn( () => ( { type: 'NOOP' } ) ),
} ) );

const reducers = { productsList, jetpackCheckout };

const makeSite = ( ID: number, slug: string ) => ( {
	ID,
	URL: `https://${ slug.replace( /::/g, '/' ) }`,
	slug,
	is_wpcom_atomic: false,
	products: [],
	plan: { product_id: 2002, product_name: 'Free', product_slug: 'jetpack_free' },
} );

describe( 'LicensingThankYouAutoActivation', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		( getJetpackSites as jest.Mock ).mockReturnValue( [
			makeSite( 111, 'first.example' ),
			makeSite( 222, 'second.example' ),
			makeSite( 333, 'third.example::blog' ),
		] );
	} );

	it( 'pre-selects the site matching the siteId query parameter', () => {
		renderWithProvider(
			<LicensingThankYouAutoActivation productSlug="jetpack_backup_t1_yearly" siteId={ 222 } />,
			{ reducers }
		);

		expect( screen.getByRole( 'button', { name: 'Continue' } ) ).toBeEnabled();
		expect( screen.getAllByText( 'https://second.example' )[ 0 ] ).toBeVisible();
	} );

	it( 'does not send a real site ID as the temporary site ID', async () => {
		renderWithProvider(
			<LicensingThankYouAutoActivation
				productSlug="jetpack_backup_t1_yearly"
				receiptId={ 5 }
				siteId={ 222 }
				jetpackTemporarySiteId={ 222 }
			/>,
			{ reducers }
		);

		await userEvent.click( screen.getByRole( 'button', { name: 'Continue' } ) );

		expect( requestUpdateJetpackCheckoutSupportTicket ).toHaveBeenCalledWith(
			'https://second.example',
			5,
			'onboarding-calypso-ui',
			0
		);
	} );

	it( 'does not pre-select a site when siteId is the temporary site', () => {
		renderWithProvider(
			<LicensingThankYouAutoActivation
				productSlug="jetpack_backup_t1_yearly"
				receiptId={ 5 }
				siteId={ 999 }
				jetpackTemporarySiteId={ 999 }
			/>,
			{ reducers }
		);

		expect( screen.getByRole( 'button', { name: 'Continue' } ) ).toBeDisabled();
	} );

	it( 'auto-activates a subdirectory site passed as fromSiteSlug', () => {
		renderWithProvider(
			<LicensingThankYouAutoActivation
				productSlug="jetpack_backup_t1_yearly"
				receiptId={ 5 }
				source="connect-after-checkout"
				jetpackTemporarySiteId={ 999 }
				fromSiteSlug="third.example::blog"
			/>,
			{ reducers }
		);

		expect( requestUpdateJetpackCheckoutSupportTicket ).toHaveBeenCalledTimes( 1 );
		expect( requestUpdateJetpackCheckoutSupportTicket ).toHaveBeenCalledWith(
			'https://third.example/blog',
			5,
			'connect-after-checkout',
			999
		);
	} );
} );
