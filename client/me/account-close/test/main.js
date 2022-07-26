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
			<ReduxProvider store={ createTestStore( true, true ) }>
				<AccountSettingsClose />
			</ReduxProvider>
		);
		expect( screen.queryByTestId( 'manage-purchases-button' ) ).toBeInTheDocument();
	} );

	it( 'Tells user to wait if they still have an Atomic site', () => {
		render(
			<ReduxProvider store={ createTestStore( false, true ) }>
				<AccountSettingsClose />
			</ReduxProvider>
		);
		expect( screen.queryByTestId( 'contact-support-button' ) ).toBeInTheDocument();
	} );

	it( 'Allows user to close account if no refundable purchases & no Atomic site', () => {
		render(
			<ReduxProvider store={ createTestStore( false, false ) }>
				<AccountSettingsClose />
			</ReduxProvider>
		);
		expect( screen.queryByTestId( 'close-account-button' ) ).toBeInTheDocument();
	} );
} );

function createTestStore( is_refundable, is_automated_transfer ) {
	return createReduxStore(
		{
			currentUser: {
				id: 1,
				user: {
					primary_blog: 'example',
				},
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
				items: {
					1234: {
						ID: '1234',
						URL: 'http://example.com',
						is_wpcom_atomic: true,
						options: {
							is_automated_transfer,
						},
					},
				},
			},
		},
		( state ) => {
			return state;
		}
	);
}
