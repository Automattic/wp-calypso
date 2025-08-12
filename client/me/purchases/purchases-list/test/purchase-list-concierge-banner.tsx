/**
 * @jest-environment jsdom
 */
// @ts-nocheck - TODO: Fix TypeScript issues
import { render, screen } from '@testing-library/react';
import * as React from 'react';
import { Provider } from 'react-redux';
import { PurchaseListConciergeBanner } from 'calypso/me/purchases/purchases-list/purchase-list-concierge-banner';
import { createReduxStore } from 'calypso/state/index';

describe( 'PurchaseListConciergeBanner tests', () => {
	test( 'not on specific site but has sites with sessions available', () => {
		render(
			<Provider store={ createTestStore( 1 ) }>
				<PurchaseListConciergeBanner availableSessions={ [ 1 ] } isUserBlocked={ false } />
			</Provider>
		);
		expect(
			screen.getByText( 'You still have a Quick Start session available' )
		).toBeInTheDocument();
		expect( screen.getByText( 'Schedule a date' ) ).toHaveAttribute(
			'href',
			'/me/quickstart/test.com'
		);
	} );
	test( 'on specific site and has session available for site', () => {
		render(
			<Provider store={ createTestStore( 2 ) }>
				<PurchaseListConciergeBanner
					availableSessions={ [ 2 ] }
					siteId={ 2 }
					isUserBlocked={ false }
				/>
			</Provider>
		);
		expect(
			screen.queryByText( 'You still have a Quick Start session available' )
		).toBeInTheDocument();
		expect( screen.getByText( 'Schedule a date' ) ).toHaveAttribute(
			'href',
			'/me/quickstart/test.com'
		);
	} );
	test( 'on a specific site but no session for that site', () => {
		render(
			<Provider store={ createTestStore( 2 ) }>
				<PurchaseListConciergeBanner
					availableSessions={ [ 1 ] }
					siteId={ 2 }
					isUserBlocked={ false }
				/>
			</Provider>
		);
		expect( screen.queryByText( 'You have unused Quick Start support sessions' ) ).toBeNull();
	} );
	test( 'has appointment scheduled for current site', () => {
		render(
			<Provider store={ createTestStore( 2 ) }>
				<PurchaseListConciergeBanner
					availableSessions={ [ 3 ] }
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
			screen.queryByText( 'Your Quick Start session is coming up soon' )
		).toBeInTheDocument();
		expect( screen.getByText( 'Session dashboard' ) ).toHaveAttribute(
			'href',
			'/me/quickstart/test.com'
		);
	} );
	test( 'has appointment scheduled for other site', () => {
		render(
			<Provider store={ createTestStore( 1 ) }>
				<PurchaseListConciergeBanner
					availableSessions={ [ 3 ] }
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
			screen.queryByText( 'Your Quick Start session is coming up soon' )
		).toBeInTheDocument();
		expect( screen.getByText( 'Session dashboard' ) ).toHaveAttribute(
			'href',
			'/me/quickstart/test.com'
		);
	} );
} );

function createTestStore( siteId ) {
	return createReduxStore(
		{
			preferences: {
				remoteValues: {},
			},
			sites: {
				items: {
					[ siteId ]: {
						URL: 'test.com',
					},
				},
			},
		},
		( state ) => {
			return state;
		}
	);
}
