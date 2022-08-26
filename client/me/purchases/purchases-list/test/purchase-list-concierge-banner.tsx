/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import * as React from 'react';
import { Provider } from 'react-redux';
import { PurchaseListConciergeBanner } from 'calypso/me/purchases/purchases-list/purchase-list-concierge-banner';
import { createReduxStore } from 'calypso/state/index';

describe( 'PurchaseListConciergeBanner tests', () => {
	test( 'not on specific site but has sites with sessions available', () => {
		render(
			<Provider store={ createTestStore() }>
				<PurchaseListConciergeBanner conciergeSites={ [ 1 ] } isUserBlocked={ false } />
			</Provider>
		);
		expect(
			screen.getByText( 'You have unused Quick Start support sessions' )
		).toBeInTheDocument();
	} );
	test( 'on specific site and has session available for site', () => {
		render(
			<Provider store={ createTestStore() }>
				<PurchaseListConciergeBanner
					conciergeSites={ [ 2 ] }
					siteId={ 2 }
					isUserBlocked={ false }
				/>
			</Provider>
		);
		expect(
			screen.queryByText( 'You have unused Quick Start support sessions' )
		).toBeInTheDocument();
	} );
	test( 'on a specific site but no session for that site', () => {
		render(
			<Provider store={ createTestStore() }>
				<PurchaseListConciergeBanner
					conciergeSites={ [ 1 ] }
					siteId={ 2 }
					isUserBlocked={ false }
				/>
			</Provider>
		);
		expect( screen.queryByText( 'You have unused Quick Start support sessions' ) ).toBeNull();
	} );
	test( 'has appointment scheduled for current site', () => {
		render(
			<Provider store={ createTestStore() }>
				<PurchaseListConciergeBanner
					conciergeSites={ [ 3 ] }
					siteId={ 2 }
					isUserBlocked={ false }
					nextAppointment={ {
						siteId: 2,
						id: 1,
						scheduleId: 1,
					} }
				/>
			</Provider>
		);
		expect(
			screen.queryByText( 'Your Quick Start session appointment is coming up!' )
		).toBeInTheDocument();
	} );
	test( 'has appointment scheduled for other site', () => {
		render(
			<Provider store={ createTestStore() }>
				<PurchaseListConciergeBanner
					conciergeSites={ [ 3 ] }
					siteId={ 2 }
					isUserBlocked={ false }
					nextAppointment={ {
						siteId: 1,
						id: 1,
						scheduleId: 1,
					} }
				/>
			</Provider>
		);
		expect(
			screen.queryByText( 'Your Quick Start session appointment is coming up!' )
		).toBeInTheDocument();
	} );
} );

function createTestStore() {
	return createReduxStore(
		{
			preferences: {
				remoteValues: {},
			},
		},
		( state ) => {
			return state;
		}
	);
}
