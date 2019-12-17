/**
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */
import { noop } from 'lodash';
import React, { ReactChild } from 'react';
import { Provider } from 'react-redux';
import { fireEvent, render, wait } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

/**
 * Internal dependencies
 */
import EligibilityWarnings from '..';
import { createReduxStore } from 'state';
import wpcom from 'lib/wp';

function renderWithStore( element: ReactChild, initialState: object ) {
	const store = createReduxStore( initialState );
	return {
		...render( <Provider store={ store }>{ element }</Provider> ),
		store,
	};
}

function createState( {
	holds = [],
	isUnlaunched = false,
	siteId = 1,
	warnings = [],
}: { holds?: string[]; isUnlaunched?: boolean; siteId?: number; warnings?: unknown[] } = {} ) {
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
		sites: { items: { [ siteId ]: { launch_status: isUnlaunched ? 'unlaunched' : 'launched' } } },
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
		expect( getByText( 'Upgrade and continue' ) ).toBeDisabled();
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

		const { container, getByLabelText } = renderWithStore(
			<EligibilityWarnings backUrl="" onProceed={ noop } />,
			state
		);

		const notices = container.querySelectorAll( '.notice.is-warning' );

		expect( notices[ 0 ] ).toBeVisible();
		expect( notices[ 0 ] ).toHaveTextContent( 'Describes warning 1' );
		expect( notices[ 1 ] ).toBeVisible();
		expect( notices[ 1 ] ).toHaveTextContent( 'Describes warning 2' );

		expect( getByLabelText( 'Help' ) ).toHaveAttribute( 'href', 'https://helpme.com' );
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

	it( 'calls onProceed prop when clicking "Upgrade and continue"', async () => {
		jest
			.spyOn( wpcom.req, 'post' )
			.mockImplementationOnce( () => Promise.resolve( { updated: { blog_public: '0' } } ) );

		const state = createState( {
			holds: [ 'NO_BUSINESS_PLAN', 'SITE_PRIVATE' ],
			isUnlaunched: false,
		} );

		const handleProceed = jest.fn();

		const { getByText } = renderWithStore(
			<EligibilityWarnings backUrl="" onProceed={ handleProceed } />,
			state
		);

		fireEvent.click( getByText( 'Upgrade and continue' ) );

		await wait( () => expect( handleProceed ).toHaveBeenCalled() );
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

	it( 'launches site if site has business plan and no other holds', async () => {
		let completePostRequest = noop;

		const post = jest
			.spyOn( wpcom.req, 'post' )
			.mockImplementationOnce( ( params, query, callback ) => {
				completePostRequest = () => callback( null, { ID: 113, options: {} }, [] );

				// Implementation expects object with this shape
				return { upload: {} };
			} );

		const state = createState( {
			holds: [ 'SITE_PRIVATE' ],
			siteId: 113,
			isUnlaunched: true,
		} );

		const handleProceed = jest.fn();

		const { getByText } = renderWithStore(
			<EligibilityWarnings backUrl="" onProceed={ handleProceed } />,
			state
		);

		fireEvent.click( getByText( 'Continue' ) );

		expect( post ).toHaveBeenCalledWith(
			expect.objectContaining( {
				path: '/sites/113/launch',
			} ),
			expect.anything(),
			expect.anything()
		);

		expect( handleProceed ).not.toHaveBeenCalled();

		completePostRequest();

		await wait( () => expect( handleProceed ).toHaveBeenCalled() );
	} );

	it( "doesn't proceed if site fails to launch", async () => {
		let completePostRequest = noop;

		const post = jest
			.spyOn( wpcom.req, 'post' )
			.mockImplementationOnce( ( params, query, callback ) => {
				completePostRequest = () => callback( new Error(), {}, [] );

				// Implementation expects object with this shape
				return { upload: {} };
			} );

		const state = createState( {
			holds: [ 'SITE_PRIVATE' ],
			siteId: 113,
			isUnlaunched: true,
		} );

		const handleProceed = jest.fn();

		const { getByText } = renderWithStore(
			<EligibilityWarnings backUrl="" onProceed={ handleProceed } />,
			state
		);

		fireEvent.click( getByText( 'Continue' ) );

		expect( post ).toHaveBeenCalledWith(
			expect.objectContaining( {
				path: '/sites/113/launch',
			} ),
			expect.anything(),
			expect.anything()
		);

		expect( handleProceed ).not.toHaveBeenCalled();

		completePostRequest();

		// Flush promises
		await new Promise( setImmediate );

		expect( handleProceed ).not.toHaveBeenCalled();
	} );

	it( 'makes site hidden if has business plan and no other holds', async () => {
		let completePostRequest = noop;

		const post = jest.spyOn( wpcom.req, 'post' ).mockImplementationOnce( () => {
			return new Promise( resolve => {
				completePostRequest = () => resolve( { updated: { blog_public: '0' } } );
			} );
		} );

		const state = createState( {
			holds: [ 'SITE_PRIVATE' ],
			siteId: 113,
			isUnlaunched: false,
		} );

		const handleProceed = jest.fn();

		const { getByText } = renderWithStore(
			<EligibilityWarnings backUrl="" onProceed={ handleProceed } />,
			state
		);

		fireEvent.click( getByText( 'Continue' ) );

		expect( post ).toHaveBeenCalledWith(
			expect.objectContaining( {
				path: '/sites/113/settings',
			} ),
			expect.anything(),
			expect.objectContaining( {
				blog_public: 0,
			} ),
			undefined // expect.anything() doesn't match undefined
		);

		expect( handleProceed ).not.toHaveBeenCalled();

		completePostRequest();

		await wait( () => expect( handleProceed ).toHaveBeenCalled() );
	} );

	it( "doesn't proceed if site fails to be set to hidden", async () => {
		let completePostRequest = noop;

		const post = jest.spyOn( wpcom.req, 'post' ).mockImplementationOnce( () => {
			return new Promise( ( resolve, reject ) => {
				completePostRequest = () => reject( new Error() );
			} );
		} );

		const state = createState( {
			holds: [ 'SITE_PRIVATE' ],
			siteId: 113,
			isUnlaunched: false,
		} );

		const handleProceed = jest.fn();

		const { getByText } = renderWithStore(
			<EligibilityWarnings backUrl="" onProceed={ handleProceed } />,
			state
		);

		fireEvent.click( getByText( 'Continue' ) );

		expect( post ).toHaveBeenCalledWith(
			expect.objectContaining( {
				path: '/sites/113/settings',
			} ),
			expect.anything(),
			expect.objectContaining( {
				blog_public: 0,
			} ),
			undefined // expect.anything() doesn't match undefined
		);

		expect( handleProceed ).not.toHaveBeenCalled();

		completePostRequest();

		// Flush promises
		await new Promise( setImmediate );

		expect( handleProceed ).not.toHaveBeenCalled();
	} );
} );
