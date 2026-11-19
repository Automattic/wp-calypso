/**
 * @jest-environment jsdom
 */
import { screen } from '@testing-library/react';
import { requestDSP } from 'calypso/lib/promote-post';
import uiReducer from 'calypso/state/ui/reducer';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import PromotePostTabBar from '../index';

jest.mock( 'calypso/lib/promote-post', () => ( {
	requestDSP: jest.fn(),
} ) );

describe( 'PromotePostTabBar', () => {
	test( 'fetches the credit balance once when there are credits to show', async () => {
		jest.mocked( requestDSP ).mockResolvedValue( {
			balance: '200',
			history: [ { amount: 200, expires: '2099-01-01T00:00:00Z' } ],
		} );

		renderWithProvider( <PromotePostTabBar tabs={ [] } selectedTab="posts" />, {
			reducers: { ui: uiReducer },
			initialState: { ui: { selectedSiteId: 1 } },
		} );

		expect( await screen.findAllByText( /Credits:/ ) ).not.toHaveLength( 0 );
		expect( requestDSP ).toHaveBeenCalledTimes( 1 );
	} );
} );
