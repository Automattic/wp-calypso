/** @jest-environment jsdom */
// @ts-nocheck - TODO: Fix TypeScript issues
jest.mock( 'calypso/state/ui/selectors', () => ( {
	getSelectedSiteId: jest.fn( () => 100 ),
} ) );

import { TERM_ANNUALLY, TERM_MONTHLY } from '@automattic/calypso-products';
import { screen } from '@testing-library/react';
import * as currentUserSelectors from 'calypso/state/currency-code/selectors';
import productsList from 'calypso/state/products-list/reducer';
import { reducer as purchases } from 'calypso/state/purchases/reducer';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import PlanUpgradeSection from '../index';

const initialState = {
	sites: {
		items: {},
		products: {},
	},
	purchases: {
		data: [],
	},
	productsList: {
		isFetching: false,
	},
};

describe( '<PlanUpgradeSection />', () => {
	beforeAll( () => {
		jest.spyOn( currentUserSelectors, 'getCurrentUserCurrencyCode' ).mockReturnValue( 'USD' );
	} );
	it( 'renders one legacy product card and one new plan product card', () => {
		renderWithProvider(
			<PlanUpgradeSection
				planRecommendation={ [ 'jetpack_personal', [ 'jetpack_scan' ] ] }
				duration={ TERM_MONTHLY }
				filterBar={ null }
				onSelectProduct={ () => null }
			/>,
			{ initialState, reducers: { purchases, productsList } }
		);

		const sectionHeader = screen.getByRole( 'heading', { level: 2 } );
		expect( sectionHeader.outerHTML ).toContain( 'Scan' );

		const productHeaders = screen.getAllByRole( 'heading', { level: 3 } );

		expect( productHeaders ).toHaveLength( 2 );

		const [ personalHeader, scanHeader ] = productHeaders;

		expect( personalHeader.outerHTML ).toContain( 'Personal' );
		expect( scanHeader.outerHTML ).toContain( 'Scan' );
	} );

	it( 'renders one legacy product card and two new plan product cards', () => {
		renderWithProvider(
			<PlanUpgradeSection
				planRecommendation={ [
					'jetpack_premium',
					[ 'jetpack_anti_spam', 'jetpack_backup_daily' ],
				] }
				duration={ TERM_MONTHLY }
				filterBar={ null }
				onSelectProduct={ () => null }
			/>,
			{ initialState, reducers: { purchases, productsList } }
		);

		const sectionHeader = screen.getByRole( 'heading', { level: 2 } );
		expect( sectionHeader.outerHTML ).toContain( 'Anti-spam' );
		expect( sectionHeader.outerHTML ).toContain( 'Backup' );

		const productHeaders = screen.getAllByRole( 'heading', { level: 3 } );

		expect( productHeaders ).toHaveLength( 3 );

		const [ personalHeader, antiSpamHeader, backupDailyHeader ] = productHeaders;

		expect( personalHeader.outerHTML ).toContain( 'Premium' );
		expect( antiSpamHeader.outerHTML ).toContain( 'Anti-spam' );
		expect( backupDailyHeader.outerHTML ).toContain( 'Backup <span>Daily</span>' );
	} );
	it( 'drops a recommended bundle that is off sale once Pro is on sale', () => {
		renderWithProvider(
			<PlanUpgradeSection
				planRecommendation={ [
					'jetpack_premium',
					[ 'jetpack_security_t1_yearly', 'jetpack_videopress' ],
				] }
				duration={ TERM_ANNUALLY }
				filterBar={ null }
				onSelectProduct={ () => null }
			/>,
			{
				initialState: {
					...initialState,
					productsList: {
						isFetching: false,
						sessionListStatus: 'full',
						items: {
							jetpack_pro_yearly: { available: true },
							jetpack_security_t1_yearly: { available: false },
						},
					},
				},
				reducers: { purchases, productsList },
			}
		);

		const productHeaders = screen.getAllByRole( 'heading', { level: 3 } );

		expect( productHeaders ).toHaveLength( 2 );
		expect( productHeaders[ 1 ].outerHTML ).toContain( 'VideoPress' );
	} );

	it( 'renders nothing when every recommended bundle is off sale once Pro is on sale', () => {
		const { container } = renderWithProvider(
			<PlanUpgradeSection
				planRecommendation={ [ 'jetpack_business', [ 'jetpack_complete' ] ] }
				duration={ TERM_ANNUALLY }
				filterBar={ null }
				onSelectProduct={ () => null }
			/>,
			{
				initialState: {
					...initialState,
					productsList: {
						isFetching: false,
						sessionListStatus: 'full',
						items: { jetpack_pro_yearly: { available: true } },
					},
				},
				reducers: { purchases, productsList },
			}
		);

		expect( container ).toBeEmptyDOMElement();
	} );
} );
