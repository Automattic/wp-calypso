/** @jest-environment jsdom */

/**
 * External dependencies
 */
import * as React from 'react';
import { render, screen } from 'calypso/test-helpers/config/testing-library';

/**
 * Internal dependencies
 */
import { TERM_MONTHLY } from '@automattic/calypso-products';
import productsList from 'calypso/state/products-list/reducer';
import { reducer as purchases } from 'calypso/state/purchases/reducer';

jest.mock( 'calypso/state/current-user/selectors', () => ( {
	getCurrentUserCurrencyCode: jest.fn( () => 'USD' ),
} ) );

jest.mock( 'calypso/state/ui/selectors', () => ( {
	getSelectedSiteId: jest.fn( () => 100 ),
} ) );

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
	it( 'renders one legacy product card and one new plan product card', () => {
		render(
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
		render(
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
		expect( sectionHeader.outerHTML ).toContain( 'Anti-spam &amp; Backup' );

		const productHeaders = screen.getAllByRole( 'heading', { level: 3 } );

		expect( productHeaders ).toHaveLength( 3 );

		const [ personalHeader, antiSpamHeader, backupDailyHeader ] = productHeaders;

		expect( personalHeader.outerHTML ).toContain( 'Premium' );
		expect( antiSpamHeader.outerHTML ).toContain( 'Anti-spam' );
		expect( backupDailyHeader.outerHTML ).toContain( 'Backup <em>Daily</em>' );
	} );
} );
