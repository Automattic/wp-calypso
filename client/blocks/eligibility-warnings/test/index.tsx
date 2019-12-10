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
import { fireEvent, render } from '@testing-library/react';
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

function createState( {
	holds = [],
	siteId = 1,
	warnings = [],
}: { holds?: string[]; siteId?: number; warnings?: unknown[] } = {} ) {
	return {
		automatedTransfer: {
			[ siteId ]: {
				eligibility: {
					eligibilityHolds: holds,
					eligibilityWarnings: warnings,
					lastUpdate: 1,
				},
			},
		},
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

		expect( container.querySelectorAll( '.notice' ) ).toHaveLength( 1 );
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

	it( 'renders warning notices when the API returns warnings', () => {
		const state = createState( {
			warnings: [
				{ name: 'Warning 1', description: 'Describes warning 1' },
				{
					name: 'Warning 2',
					description: 'Describes warning 2',
					supportUrl: 'http://example.com/',
				},
			],
		} );

		const { container, getByLabelText } = renderWithStore(
			<EligibilityWarnings backUrl="" onProceed={ noop } />,
			state
		);

		const notices = container.querySelectorAll( '.notice.is-warning' );

		expect( notices[ 0 ] ).toBeVisible();
		expect( notices[ 0 ] ).toHaveTextContent( 'Describes warning 1' );
		expect( notices[ 1 ] ).toBeVisible();
		expect( notices[ 1 ] ).toHaveTextContent( 'Describes warning 2' );

		fireEvent.click( getByLabelText( 'Help' ) );

		expect( window.location.href ).toBe( 'https://example.com/' );
	} );

	it( "doesn't render warnings when there are blocking holds", () => {
		const state = createState( {
			holds: [ 'BLOCKED_ATOMIC_TRANSFER' ],
			warnings: [
				{
					name: 'Warning',
					description: 'Description',
				},
			],
		} );

		const { container } = renderWithStore(
			<EligibilityWarnings backUrl="" onProceed={ noop } />,
			state
		);

		expect( container.querySelectorAll( '.notice.is-warning' ) ).toHaveLength( 0 );
	} );
} );
