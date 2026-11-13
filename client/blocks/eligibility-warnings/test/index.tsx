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

let mockDevToolsAllPaidPlans = true;
jest.mock( '@automattic/calypso-config', () => {
	const actual = jest.requireActual( '@automattic/calypso-config' );
	const actualConfig = actual.default ?? actual;
	const isEnabled = ( flag: string ) =>
		flag === 'hosting/dev-tools-all-paid-plans'
			? mockDevToolsAllPaidPlans
			: actualConfig.isEnabled( flag );
	const config = Object.assign( ( key: string ) => actualConfig( key ), actualConfig, {
		isEnabled,
	} );
	return { __esModule: true, ...actual, default: config, isEnabled };
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
		mockDevToolsAllPaidPlans = true;
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
		expect( notice ).toHaveTextContent( /Setting up your site/ );
		expect( queryByText( 'Get help' ) ).toBeVisible();
		expect( queryByText( 'Need help?' ) ).not.toBeInTheDocument();
		expect( queryByTestId( 'HoldList-Card' ) ).not.toBeInTheDocument();
		expect( queryByText( 'Continue' ) ).not.toBeInTheDocument();
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
		expect(
			getByText(
				'You can install plugins on any paid plan. You’ll choose your plan in the next step.'
			)
		).toBeVisible();
	} );

	it( 'asks to choose any paid plan in the plugin modal and keeps the site move intro', () => {
		const state = createState( {
			holds: [ 'NO_BUSINESS_PLAN' ],
			warnings: [ { name: 'Warning', description: 'Describes the transfer' } ],
		} );

		const { getByText, queryByText } = renderWithStore(
			<EligibilityWarnings
				onProceed={ noop }
				context="plugin-details"
				atomicTransferAction="plugins"
				inModal
			/>,
			state
		);

		expect(
			getByText(
				'You can install plugins on any paid plan. You’ll choose your plan in the next step.'
			)
		).toBeVisible();
		expect( queryByText( "To continue you'll need to:" ) ).toBeNull();
		expect(
			getByText(
				'To install plugins, we’ll need to move your site over to WordPress.com’s advanced managed cloud hosting.'
			)
		).toBeVisible();
		expect( getByText( 'Choose a plan' ) ).toBeVisible();
	} );

	it( 'keeps the Business plan wording in the plugin modal when not all paid plans qualify', () => {
		mockDevToolsAllPaidPlans = false;
		const state = createState( {
			holds: [ 'NO_BUSINESS_PLAN' ],
			warnings: [ { name: 'Warning', description: 'Describes the transfer' } ],
		} );

		const { getByText, queryByText } = renderWithStore(
			<EligibilityWarnings
				onProceed={ noop }
				context="plugin-details"
				atomicTransferAction="plugins"
				inModal
			/>,
			state
		);

		expect( getByText( 'Upgrade to a Business plan' ) ).toBeVisible();
		expect(
			getByText(
				'To install plugins, we’ll need to move your site over to WordPress.com’s advanced managed cloud hosting.'
			)
		).toBeVisible();
		expect( queryByText( /^You can install plugins on any paid plan/ ) ).toBeNull();
		expect( getByText( 'Upgrade and activate plugin' ) ).toBeVisible();
	} );

	it( 'keeps the plan perks and the site move intro outside the plugin modal', () => {
		const state = createState( {
			holds: [ 'NO_BUSINESS_PLAN' ],
			warnings: [ { name: 'Warning', description: 'Describes the transfer' } ],
		} );

		const { getByText, queryByText } = renderWithStore(
			<EligibilityWarnings onProceed={ noop } context={ null } atomicTransferAction="plugins" />,
			state
		);

		expect( getByText( 'Upgrade to a Business plan' ) ).toBeVisible();
		expect(
			getByText(
				"You'll also get to install custom themes, have more storage, and access priority 24/7 support."
			)
		).toBeVisible();
		expect(
			getByText(
				'To install plugins, we’ll need to move your site over to WordPress.com’s advanced managed cloud hosting.'
			)
		).toBeVisible();
		expect( queryByText( /^You can install plugins on any paid plan/ ) ).toBeNull();
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

	it( 'warns that the new address is not indexed by search engines', () => {
		const state = createState( {
			warnings: [
				{
					name: 'Subdomain',
					description: 'Your site address will change',
					domainNames: { current: 'example.wordpress.com', new: 'example.wpcomstaging.com' },
				},
			],
		} );

		const { getByText } = renderWithStore(
			<EligibilityWarnings
				onProceed={ noop }
				context="hosting-features"
				atomicTransferAction="hosting-features"
				inModal
			/>,
			state
		);

		expect( getByText( 'Your site’s address will change' ) ).toBeVisible();
		expect(
			getByText(
				'To turn hosting features on, we’ll need to move your site over to WordPress.com’s advanced managed cloud hosting. Links to your old address will redirect automatically.'
			)
		).toBeVisible();
		expect( getByText( /^Search engines don’t index the new address\./ ) ).toBeVisible();
		expect( getByText( 'Current' ) ).toBeVisible();
		expect( getByText( 'New' ) ).toBeVisible();
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
