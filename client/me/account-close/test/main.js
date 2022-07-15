/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import { Provider as ReduxProvider } from 'react-redux';
import { createReduxStore } from 'calypso/state';
import AccountSettingsClose from '../main';

describe( 'AccountSettingsClose', () => {
	it( 'Shows Manage purchases button when refundable purchases exist', () => {
		render(
			<ReduxProvider store={ createTestStore( true ) }>
				<AccountSettingsClose />
			</ReduxProvider>
		);
		expect( screen.queryByTestId( 'manage-purchases-button' ) ).toBeInTheDocument();
	} );

	it( 'Allows user to close account if no refundable purchases', () => {
		render(
			<ReduxProvider store={ createTestStore( false ) }>
				<AccountSettingsClose />
			</ReduxProvider>
		);
		expect( screen.queryByTestId( 'close-account-button' ) ).toBeInTheDocument();
	} );
} );

function createTestStore( is_refundable ) {
	return createReduxStore(
		{
			currentUser: {
				id: 1,
			},
			purchases: {
				hasLoadedUserPurchasesFromServer: true,
				data: [
					{
						is_refundable,
						user_id: 1,
						product_slug: 'premium_theme',
					},
				],
			},
			sites: {
				items: [],
			},
		},
		( state ) => {
			return state;
		}
	);
}
