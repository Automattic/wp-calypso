/**
 * @jest-environment jsdom
 */
// @ts-nocheck - TODO: Fix TypeScript issues

import page from '@automattic/calypso-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ReactElement } from 'react';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import EligibilityWarnings from '..';

jest.mock( '@automattic/calypso-router', () => ( {
	redirect: jest.fn(),
} ) );

const mockFetchLatestAtomicTransfer = jest.fn();

jest.mock( '@automattic/api-core', () => ( {
	...jest.requireActual( '@automattic/api-core' ),
	fetchLatestAtomicTransfer: ( siteId: number ) => mockFetchLatestAtomicTransfer( siteId ),
} ) );

const inFlightTransfer = ( { agoMs = 0, isStuck = false } = {} ) => ( {
	atomic_transfer_id: 10,
	blog_id: 1,
	status: 'active',
	created_at: new Date( Date.now() - agoMs ).toISOString(),
	is_stuck: isStuck,
	is_stuck_reset: false,
	in_lossless_revert: false,
} );

jest.mock( '@automattic/odie-client/src/data', () => ( {
	useManageSupportInteraction: () => ( {
		startNewInteraction: jest.fn().mockResolvedValue( undefined ),
		resolveInteraction: jest.fn().mockResolvedValue( undefined ),
		addEventToInteraction: jest.fn().mockResolvedValue( undefined ),
	} ),
	useGetZendeskConversation: jest.fn(),
	useOdieChat: jest.fn(),
	broadcastOdieMessage: jest.fn(),
} ) );

function renderWithStore( element: ReactElement, initialState: Record< string, unknown > ) {
	const store = createStore( ( state ) => state, initialState );
	const queryClient = new QueryClient( {
		defaultOptions: { queries: { retry: false } },
	} );
	return {
		...render(
			<Provider store={ store }>
				<QueryClientProvider client={ queryClient }>{ element }</QueryClientProvider>
			</Provider>
		),
		store,
	};
}

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = () => {};

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
		marketplace: { billingInterval: { interval: 'ANNUALLY' } },
	};
}

describe( '<EligibilityWarnings>', () => {
	beforeEach( () => {
		page.redirect.mockReset();
		// A site that has never transferred answers 404, which is the right default for every test
		// that isn't about the transfer itself.
		mockFetchLatestAtomicTransfer.mockReset();
		mockFetchLatestAtomicTransfer.mockRejectedValue( { status: 404 } );
	} );

	afterAll( () => {
		jest.restoreAllMocks();
	} );

	it( 'renders error notice when AT has been blocked by a sticker', () => {
		const state = createState( {
			holds: [ 'BLOCKED_ATOMIC_TRANSFER' ],
		} );

		const { container } = renderWithStore(
			<EligibilityWarnings context={ null } onProceed={ noop } />,
			state
		);

		const notice = container.querySelector( '.calypso-notice.is-error' );

		expect( notice ).toBeVisible();
		expect( notice ).toHaveTextContent( /This site is not currently eligible/ );
	} );

	it( 'only renders a single notice when multible hard blocking holds exist', () => {
		const state = createState( {
			holds: [ 'BLOCKED_ATOMIC_TRANSFER', 'SITE_GRAYLISTED' ],
		} );

		const { container } = renderWithStore(
			<EligibilityWarnings context={ null } onProceed={ noop } />,
			state
		);

		expect( container.querySelectorAll( '.calypso-notice' ) ).toHaveLength( 1 );
	} );

	it( 'hides the hold list and Continue button when AT has been blocked by a sticker', () => {
		const state = createState( {
			holds: [ 'BLOCKED_ATOMIC_TRANSFER', 'SITE_PRIVATE' ],
		} );

		const { queryByTestId, queryByText } = renderWithStore(
			<EligibilityWarnings context={ null } onProceed={ noop } />,
			state
		);

		expect( queryByTestId( 'HoldList-Card' ) ).not.toBeInTheDocument();
		expect( queryByText( 'Continue' ) ).not.toBeInTheDocument();
	} );

	it( 'hides the hold list when no hold has a message to show', () => {
		const state = createState( {
			holds: [ 'AN_UNRECOGNIZED_HOLD' ],
		} );

		const { queryByTestId } = renderWithStore(
			<EligibilityWarnings context={ null } onProceed={ noop } />,
			state
		);

		expect( queryByTestId( 'HoldList-Card' ) ).not.toBeInTheDocument();
	} );

	it( 'renders only the in-progress notice when a transfer already exists', () => {
		const state = createState( {
			holds: [ 'TRANSFER_ALREADY_EXISTS', 'SITE_PRIVATE' ],
		} );

		const { container, queryByTestId, queryByText } = renderWithStore(
			<EligibilityWarnings context={ null } onProceed={ noop } />,
			state
		);

		const notice = container.querySelector( '.calypso-notice' );
		expect( notice ).toBeVisible();
		expect( notice ).toHaveTextContent( /Installation in progress/ );
		expect( queryByTestId( 'HoldList-Card' ) ).not.toBeInTheDocument();
		expect( queryByText( 'Continue' ) ).not.toBeInTheDocument();
	} );

	it( 'keeps the in-progress notice reassuring while the transfer is still young', async () => {
		mockFetchLatestAtomicTransfer.mockResolvedValue( inFlightTransfer( { agoMs: 10 * 1000 } ) );

		const { container } = renderWithStore(
			<EligibilityWarnings context={ null } onProceed={ noop } />,
			createState( { holds: [ 'TRANSFER_ALREADY_EXISTS' ] } )
		);

		await waitFor( () => expect( mockFetchLatestAtomicTransfer ).toHaveBeenCalled() );

		const notice = container.querySelector( '.calypso-notice' );
		expect( notice ).toHaveTextContent( /Just a minute!/ );
		expect( screen.queryByText( 'Get help' ) ).not.toBeInTheDocument();
	} );

	it( 'escalates on the transfer’s own age, before the backend calls it stuck', async () => {
		// Past the deadline but not yet flagged: the age is the only thing that can escalate here,
		// and it is read from the transfer rather than from when this modal opened.
		mockFetchLatestAtomicTransfer.mockResolvedValue( inFlightTransfer( { agoMs: 6 * 60 * 1000 } ) );

		const { container } = renderWithStore(
			<EligibilityWarnings context={ null } onProceed={ noop } />,
			createState( { holds: [ 'TRANSFER_ALREADY_EXISTS' ] } )
		);

		await waitFor( () =>
			expect( container.querySelector( '.calypso-notice' ) ).toHaveTextContent(
				/taking longer than it should/
			)
		);
		expect( screen.getByText( 'Get help' ) ).toBeVisible();
	} );

	it( 'offers a way to reach support once the backend calls the transfer stuck', async () => {
		mockFetchLatestAtomicTransfer.mockResolvedValue( inFlightTransfer( { isStuck: true } ) );

		const { container } = renderWithStore(
			<EligibilityWarnings context={ null } onProceed={ noop } />,
			createState( { holds: [ 'TRANSFER_ALREADY_EXISTS' ] } )
		);

		await waitFor( () =>
			expect( container.querySelector( '.calypso-notice' ) ).toHaveTextContent(
				/taking longer than it should/
			)
		);
		expect( container.querySelector( '.is-warning' ) ).toBeVisible();
		expect( screen.getByText( 'Get help' ) ).toBeVisible();
		// The generic footer link would be a second route to the same place.
		expect( screen.queryByText( 'Need help?' ) ).not.toBeInTheDocument();
	} );

	it( 'shows the upgrade path, not the blocking notice, for an Atomic site below Business', () => {
		const state = createState( {
			holds: [ 'TRANSFER_ALREADY_EXISTS', 'NO_BUSINESS_PLAN' ],
		} );

		const { container, getByTestId, getByText } = renderWithStore(
			<EligibilityWarnings context={ null } onProceed={ noop } />,
			state
		);

		expect( container.querySelector( '.calypso-notice' ) ).not.toBeInTheDocument();
		expect( getByTestId( 'HoldList-Card' ) ).toBeVisible();
		expect( getByText( 'Upgrade and continue' ) ).toBeEnabled();
	} );

	it( 'explains the upgrade in the plugin details modal', () => {
		const state = createState( { holds: [ 'NO_BUSINESS_PLAN' ] } );

		const { getByTestId, getByText } = renderWithStore(
			<EligibilityWarnings onProceed={ noop } context="plugin-details" inModal />,
			state
		);

		expect( getByTestId( 'HoldList-Card' ) ).toBeVisible();
		expect( getByText( 'Upgrade to a Business plan' ) ).toBeVisible();
	} );

	it( 'renders warning notices when the API returns warnings', () => {
		const state = createState( {
			warnings: [
				{ name: 'Warning 1', description: 'Describes warning 1' },
				{
					name: 'Warning 2',
					description: 'Describes warning 2',
					supportPostId: 123,
					supportUrl: 'https://helpme.com',
				},
			],
		} );

		const { getByRole, getByText } = renderWithStore(
			<EligibilityWarnings context={ null } onProceed={ noop } />,
			state
		);

		expect( getByText( 'Warning 1' ) ).toBeVisible();
		expect( getByText( 'Describes warning 1' ) ).toBeVisible();
		expect( getByText( 'Warning 2' ) ).toBeVisible();
		expect( getByText( 'Describes warning 2' ) ).toBeVisible();

		expect( getByRole( 'link' ) ).toHaveAttribute( 'href', 'https://helpme.com' );
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
			<EligibilityWarnings context={ null } onProceed={ noop } />,
			state
		);

		expect( container.querySelectorAll( '.calypso-notice.is-warning' ) ).toHaveLength( 0 );
	} );

	it( 'goes to checkout when clicking "Upgrade and continue"', async () => {
		const state = createState( {
			holds: [ 'NO_BUSINESS_PLAN' ],
			siteUrl: 'https://example.wordpress.com',
		} );

		const handleProceed = jest.fn();

		const { getByText } = renderWithStore(
			<EligibilityWarnings context={ null } onProceed={ handleProceed } />,
			state
		);

		const upgradeAndContinue = getByText( 'Upgrade and continue' );
		expect( upgradeAndContinue ).toBeVisible();
		expect( upgradeAndContinue ).not.toBeDisabled();

		await userEvent.click( upgradeAndContinue );

		expect( handleProceed ).not.toHaveBeenCalled();
		expect( page.redirect ).toHaveBeenCalledTimes( 1 );
		expect( page.redirect ).toHaveBeenCalledWith(
			'/checkout/example.wordpress.com/business-bundle'
		);
	} );

	it( 'upsells the Personal plan when uploading a plugin', async () => {
		const state = createState( {
			holds: [ 'NO_BUSINESS_PLAN' ],
			siteUrl: 'https://example.wordpress.com',
		} );

		const { getByText } = renderWithStore(
			<EligibilityWarnings context="plugins-upload" onProceed={ noop } />,
			state
		);

		await userEvent.click( getByText( 'Upgrade and continue' ) );

		expect( page.redirect ).toHaveBeenCalledWith(
			expect.stringContaining( '/checkout/example.wordpress.com/personal-bundle' )
		);
	} );

	it( 'disables the "Continue" button if holds can\'t be handled automatically', async () => {
		const state = createState( {
			holds: [ 'NON_ADMIN_USER', 'SITE_PRIVATE' ],
		} );

		const handleProceed = jest.fn();

		const { getByText } = renderWithStore(
			<EligibilityWarnings context={ null } onProceed={ handleProceed } />,
			state
		);

		const continueButton = getByText( 'Continue' );

		expect( continueButton ).toBeDisabled();

		await userEvent.click( continueButton );
		expect( handleProceed ).not.toHaveBeenCalled();
	} );

	it( 'renders a help button', async () => {
		const state = createState( {} );

		const { getByText } = renderWithStore(
			<EligibilityWarnings context={ null } onProceed={ noop } />,
			state
		);

		const helpCenterButton = getByText( 'Need help?' );
		expect( helpCenterButton ).toBeVisible();
		expect( helpCenterButton ).toBeInstanceOf( HTMLButtonElement );
	} );
} );
