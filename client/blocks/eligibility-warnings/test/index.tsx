/**
 * @jest-environment jsdom
 */
// @ts-nocheck - TODO: Fix TypeScript issues

import page from '@automattic/calypso-router';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ReactElement } from 'react';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import EligibilityWarnings from '..';

jest.mock( '@automattic/calypso-router', () => ( {
	redirect: jest.fn(),
} ) );

jest.mock( '@automattic/help-center/src/hooks/use-reset-support-interaction', () => ( {
	useResetSupportInteraction: () => jest.fn().mockResolvedValue( undefined ),
} ) );

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

jest.mock( '@automattic/odie-client/src/utils/storage-utils', () => ( {
	clearHelpCenterZendeskConversationStarted: jest.fn(),
} ) );

function renderWithStore( element: ReactElement, initialState: Record< string, unknown > ) {
	const store = createStore( ( state ) => state, initialState );
	return {
		...render( <Provider store={ store }>{ element }</Provider> ),
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
	} );

	afterAll( () => {
		jest.restoreAllMocks();
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

	it( 'goes to checkout when clicking "Upgrade and continue"', async () => {
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

		await userEvent.click( upgradeAndContinue );

		expect( handleProceed ).not.toHaveBeenCalled();
		expect( page.redirect ).toHaveBeenCalledTimes( 1 );
		expect( page.redirect ).toHaveBeenCalledWith(
			'/checkout/example.wordpress.com/business-bundle'
		);
	} );

	it( 'disables the "Continue" button if holds can\'t be handled automatically', async () => {
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

		await userEvent.click( continueButton );
		expect( handleProceed ).not.toHaveBeenCalled();
	} );

	it( 'renders a help button', async () => {
		const state = createState( {} );

		const { getByText } = renderWithStore(
			<EligibilityWarnings backUrl="" onProceed={ noop } />,
			state
		);

		const helpCenterButton = getByText( 'Need help?' );
		expect( helpCenterButton ).toBeVisible();
		expect( helpCenterButton ).toBeInstanceOf( HTMLButtonElement );
	} );
} );
