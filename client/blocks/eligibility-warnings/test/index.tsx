/**
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */
import page from 'page';
import { noop } from 'lodash';
import React, { ReactChild } from 'react';
import { createStore } from 'redux';
import { Provider } from 'react-redux';
import { fireEvent, render } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

/**
 * Internal dependencies
 */
jest.mock( 'page', () => ( {
	redirect: jest.fn(),
} ) );

import EligibilityWarnings from '..';

function renderWithStore( element: ReactChild, initialState: object ) {
	const store = createStore( ( state ) => state, initialState );
	return {
		...render( <Provider store={ store }>{ element }</Provider> ),
		store,
	};
}

global.document = {};

function createState( {
	holds = [],
	siteId = 1,
	siteUrl = 'https://example.wordpress.com',
	warnings = [],
}: { holds?: string[]; siteId?: number; siteUrl?: string; warnings?: unknown[] } = {} ) {
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
		sites: { items: { [ siteId ]: { URL: siteUrl } } },
		ui: { selectedSiteId: siteId },
		siteSettings: {
			saveRequests: {},
		},
	};
}

describe( '<EligibilityWarnings>', () => {
	beforeEach( () => {
		page.redirect.mockReset();
	} );

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
			holds: [ 'BLOCKED_ATOMIC_TRANSFER', 'SITE_PRIVATE' ],
		} );

		const { getByTestId, getByText } = renderWithStore(
			<EligibilityWarnings backUrl="" onProceed={ noop } />,
			state
		);

		expect( getByTestId( 'HoldList-Card' ) ).toHaveClass( 'eligibility-warnings__hold-list-dim' );
		expect( getByText( 'Help' ) ).toHaveAttribute( 'disabled' );
		expect( getByText( 'Continue' ) ).toBeDisabled();
	} );

	it( 'renders warning notices when the API returns warnings', () => {
		const state = createState( {
			warnings: [
				{ name: 'Warning 1', description: 'Describes warning 1' },
				{
					name: 'Warning 2',
					description: 'Describes warning 2',
					supportUrl: 'https://helpme.com',
				},
			],
		} );

		const { getByText } = renderWithStore(
			<EligibilityWarnings backUrl="" onProceed={ noop } />,
			state
		);

		expect( getByText( 'Warning 1' ) ).toBeVisible();
		expect( getByText( 'Describes warning 1' ) ).toBeVisible();
		expect( getByText( 'Warning 2' ) ).toBeVisible();
		expect( getByText( 'Describes warning 2' ) ).toBeVisible();

		expect( getByText( 'Learn more.' ) ).toHaveAttribute( 'href', 'https://helpme.com' );
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

	it( 'goes to checkout when clicking "Upgrade and continue"', () => {
		const state = createState( {
			holds: [ 'NO_BUSINESS_PLAN' ],
			siteUrl: 'https://example.wordpress.com',
		} );

		const handleProceed = jest.fn();

		const { getByText } = renderWithStore(
			<EligibilityWarnings backUrl="" onProceed={ handleProceed } />,
			state
		);

		const upgradeAndContinue = getByText( 'Upgrade and continue' );
		expect( upgradeAndContinue ).toBeVisible();
		expect( upgradeAndContinue ).not.toBeDisabled();

		fireEvent.click( upgradeAndContinue );

		expect( handleProceed ).not.toHaveBeenCalled();
		expect( page.redirect ).toHaveBeenCalledTimes( 1 );
		expect( page.redirect ).toHaveBeenCalledWith( '/checkout/example.wordpress.com/business' );
	} );

	it( `disables the "Continue" button if holds can't be handled automatically`, () => {
		const state = createState( {
			holds: [ 'NON_ADMIN_USER', 'SITE_PRIVATE' ],
		} );

		const handleProceed = jest.fn();

		const { getByText } = renderWithStore(
			<EligibilityWarnings backUrl="" onProceed={ handleProceed } />,
			state
		);

		const continueButton = getByText( 'Continue' );

		expect( continueButton ).toBeDisabled();

		fireEvent.click( continueButton );
		expect( handleProceed ).not.toHaveBeenCalled();
	} );
} );
