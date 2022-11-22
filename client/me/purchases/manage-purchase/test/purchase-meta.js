/**
 * @jest-environment jsdom
 */

/* eslint-disable jest/no-conditional-expect */
/* eslint-disable jest/valid-title */

import { render, screen } from '@testing-library/react';
import { Provider as ReduxProvider } from 'react-redux';
import { createReduxStore } from 'calypso/state';
import PurchaseMeta from '../purchase-meta';

describe( 'PurchaseMeta', () => {
	const store = createReduxStore(
		{
			purchases: {
				data: [
					{
						ID: 1,
						expiry_status: 'included',
					},
				],
			},
			sites: {
				requestingAll: false,
			},
			currentUser: {
				id: 1,
				user: {
					primary_blog: 'example',
				},
			},
		},
		( state ) => state
	);

	it( 'does render "Free with Plan"', () => {
		render(
			<ReduxProvider store={ store }>
				<PurchaseMeta
					hasLoadedPurchasesFromServer={ true }
					purchaseId={ 1 }
					siteSlug="test"
					isDataLoading={ false }
				/>
			</ReduxProvider>
		);
		expect( screen.getByText( /Free with Plan/ ) ).toBeInTheDocument();
	} );
} );
