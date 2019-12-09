/**
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */
import { noop } from 'lodash';
import React, { ReactChild } from 'react';
import { createStore } from 'redux';
import { Provider } from 'react-redux';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

/**
 * Internal dependencies
 */
import EligibilityWarnings from '..';

function renderWithStore( element: ReactChild, initialState: object ) {
	const store = createStore( state => state, initialState );
	return {
		...render( <Provider store={ store }>{ element }</Provider> ),
		store,
	};
}

function createState( { holds = [], siteId = 1 }: { holds?: string[]; siteId?: number } = {} ) {
	return {
		automatedTransfer: {
			[ siteId ]: {
				eligibility: {
					eligibilityHolds: holds,
					lastUpdate: 1,
				},
			},
		},
		currentUser: { capabilities: { [ siteId ]: {} } },
		sites: { items: { [ siteId ]: {} } },
		ui: { selectedSiteId: siteId },
	};
}

describe( '<EligibilityWarnings>', () => {
	it( 'renders error notice when AT has been blocked by a sticker', () => {
		const state = createState( {
			holds: [ 'BLOCKED_ATOMIC_TRANSFER' ],
		} );

		const { container } = renderWithStore(
			<EligibilityWarnings backUrl="" onProceed={ noop } />,
			state
		);

		const notice = container.querySelector( '.notice.is-error' );

		expect( notice ).toBeVisible();
		expect( notice ).toHaveTextContent( /This site is not currently eligible/ );
	} );

	it( 'only renders a single notice when multible hard blocking holds exist', () => {
		const state = createState( {
			holds: [ 'BLOCKED_ATOMIC_TRANSFER', 'SITE_GRAYLISTED' ],
		} );

		const { container } = renderWithStore(
			<EligibilityWarnings backUrl="" onProceed={ noop } />,
			state
		);

		expect( container.querySelectorAll( '.notice' ).length ).toBe( 1 );
	} );

	it( 'dimly renders the hold card when AT has been blocked by a sticker', () => {
		const state = createState( {
			holds: [ 'BLOCKED_ATOMIC_TRANSFER', 'NO_BUSINESS_PLAN', 'SITE_PRIVATE' ],
		} );

		const { getByTestId, getByText } = renderWithStore(
			<EligibilityWarnings backUrl="" onProceed={ noop } />,
			state
		);

		expect( getByTestId( 'HoldList-Card' ) ).toHaveClass( 'eligibility-warnings__hold-list-dim' );
		expect( getByText( 'Help' ) ).toHaveAttribute( 'disabled' );
	} );
} );
