/**
 * @jest-environment jsdom
 */
import { DomainSubtype } from '@automattic/api-core';
import { queryClient } from '@automattic/api-queries';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { type ComponentProps } from 'react';
import PreLaunchSiteModal from '../index';

let mockSite: Record< string, unknown >;
let mockDomains: unknown;
let mockSiteError = false;
let mockDomainsError = false;
let mockIsPaid = true;

jest.mock( '@automattic/api-queries', () => ( {
	queryClient: new ( jest.requireActual( '@tanstack/react-query' ).QueryClient )( {
		defaultOptions: { queries: { retry: false } },
	} ),
	siteByIdQuery: ( siteId: number ) => ( {
		queryKey: [ 'site', siteId ],
		queryFn: async () => {
			if ( mockSiteError ) {
				throw new Error( 'boom' );
			}
			return mockSite;
		},
	} ),
	domainsQuery: () => ( {
		queryKey: [ 'domains' ],
		queryFn: async () => {
			if ( mockDomainsError ) {
				throw new Error( 'boom' );
			}
			return mockDomains;
		},
	} ),
} ) );

jest.mock( 'calypso/dashboard/sites/plans', () => ( {
	isSitePlanPaid: () => mockIsPaid,
} ) );

jest.mock( 'calypso/dashboard/utils/site-plan', () => ( {
	getSitePlanDisplayName: () => 'Business',
} ) );

jest.mock( 'calypso/dashboard/sites/site-preview', () => ( {
	__esModule: true,
	default: () => <div data-testid="site-preview" />,
} ) );

// Stub the presentational package modal, but keep every prop the bridge is
// responsible for wiring (name/domain/plan, the launch + close callbacks, and
// the launching state) observable so this suite can assert the wiring.
jest.mock( '@automattic/site-launch-modals', () => ( {
	__esModule: true,
	PreLaunchModal: ( {
		siteName,
		siteDomain,
		planName,
		isLaunching,
		onLaunch,
		onClose,
	}: {
		siteName: string;
		siteDomain: string;
		planName: string;
		isLaunching: boolean;
		onLaunch: () => void;
		onClose: () => void;
	} ) => (
		<div data-testid="pre-launch-modal" data-launching={ isLaunching }>
			<span>{ siteName }</span>
			<span>{ siteDomain }</span>
			<span>{ planName }</span>
			<button onClick={ onLaunch }>Yes, launch site!</button>
			<button onClick={ onClose }>Close</button>
		</div>
	),
} ) );

const LAUNCH_URL = '/start/launch-site?siteSlug=example.wordpress.com';
const registeredDomain = {
	blog_id: 1,
	domain: 'example.com',
	subtype: { id: DomainSubtype.DOMAIN_REGISTRATION },
};
const connectedDomain = {
	blog_id: 1,
	domain: 'connected.example',
	subtype: { id: DomainSubtype.DOMAIN_CONNECTION },
};
const wpcomDomain = {
	blog_id: 1,
	domain: 'example.wordpress.com',
	subtype: { id: DomainSubtype.DEFAULT_ADDRESS },
};

function renderBridge( props: Partial< ComponentProps< typeof PreLaunchSiteModal > > = {} ) {
	return render(
		<PreLaunchSiteModal
			siteId={ 1 }
			isOpen
			onClose={ jest.fn() }
			launchUrl={ LAUNCH_URL }
			{ ...props }
		/>
	);
}

describe( 'PreLaunchSiteModal', () => {
	const assign = jest.fn();

	beforeEach( () => {
		jest.clearAllMocks();
		// The mocked queryClient is a module-level singleton, so clear its cache
		// between tests to keep them isolated and order-independent.
		queryClient.clear();
		Object.defineProperty( window, 'location', {
			configurable: true,
			value: { assign, pathname: '/home' },
		} );
		mockSite = {
			ID: 1,
			name: 'My Site',
			slug: 'example.wordpress.com',
			URL: 'https://example.com',
		};
		mockDomains = [ registeredDomain ];
		mockSiteError = false;
		mockDomainsError = false;
		mockIsPaid = true;
	} );

	it( 'shows the modal for a paid plan + custom domain site', async () => {
		renderBridge();

		expect( await screen.findByTestId( 'pre-launch-modal' ) ).toBeVisible();
		expect( screen.getByText( 'My Site' ) ).toBeVisible();
		expect( screen.getByText( 'example.com' ) ).toBeVisible();
		// No `plan` on the fixture, so the display-name fallback is what renders.
		expect( screen.getByText( 'Business' ) ).toBeVisible();
		expect( assign ).not.toHaveBeenCalled();
	} );

	it( 'prefers the plan product name over the display-name fallback', async () => {
		mockSite.plan = { product_name: 'Commerce' };

		renderBridge();

		expect( await screen.findByTestId( 'pre-launch-modal' ) ).toBeVisible();
		expect( screen.getByText( 'Commerce' ) ).toBeVisible();
		expect( screen.queryByText( 'Business' ) ).not.toBeInTheDocument();
	} );

	it( 'redirects to the launch flow on confirm, showing the launching state', async () => {
		const user = userEvent.setup();
		renderBridge();

		const modal = await screen.findByTestId( 'pre-launch-modal' );
		expect( modal ).toHaveAttribute( 'data-launching', 'false' );

		await user.click( screen.getByRole( 'button', { name: 'Yes, launch site!' } ) );

		expect( assign ).toHaveBeenCalledWith( LAUNCH_URL );
		expect( screen.getByTestId( 'pre-launch-modal' ) ).toHaveAttribute( 'data-launching', 'true' );
	} );

	it( 'passes the caller onClose through to the modal', async () => {
		const user = userEvent.setup();
		const onClose = jest.fn();
		renderBridge( { onClose } );

		await screen.findByTestId( 'pre-launch-modal' );
		await user.click( screen.getByRole( 'button', { name: 'Close' } ) );

		expect( onClose ).toHaveBeenCalledTimes( 1 );
		expect( assign ).not.toHaveBeenCalled();
	} );

	it( 'runs onConfirm instead of redirecting when the site qualifies', async () => {
		const user = userEvent.setup();
		const onConfirm = jest.fn();
		renderBridge( { onConfirm } );

		await screen.findByTestId( 'pre-launch-modal' );
		await user.click( screen.getByRole( 'button', { name: 'Yes, launch site!' } ) );

		expect( onConfirm ).toHaveBeenCalledTimes( 1 );
		expect( assign ).not.toHaveBeenCalled();
		expect( screen.getByTestId( 'pre-launch-modal' ) ).toHaveAttribute( 'data-launching', 'true' );
	} );

	it( 'runs onSkip instead of redirecting when the site does not qualify', async () => {
		mockIsPaid = false;
		const onSkip = jest.fn();
		renderBridge( { onSkip } );

		await waitFor( () => expect( onSkip ).toHaveBeenCalledTimes( 1 ) );
		expect( assign ).not.toHaveBeenCalled();
		expect( screen.queryByTestId( 'pre-launch-modal' ) ).not.toBeInTheDocument();
	} );

	it( 'redirects straight to the launch flow when the plan is not paid', async () => {
		mockIsPaid = false;

		renderBridge();

		await waitFor( () => expect( assign ).toHaveBeenCalledWith( LAUNCH_URL ) );
		expect( screen.queryByTestId( 'pre-launch-modal' ) ).not.toBeInTheDocument();
	} );

	it( 'redirects when the site only has the default WPCOM address', async () => {
		mockDomains = [ wpcomDomain ];

		renderBridge();

		await waitFor( () => expect( assign ).toHaveBeenCalledWith( LAUNCH_URL ) );
		expect( screen.queryByTestId( 'pre-launch-modal' ) ).not.toBeInTheDocument();
	} );

	it( 'shows the modal for a connected (mapped) domain, matching the flow skip rule', async () => {
		// A connected domain has no subscription of its own, but the launch flow
		// still skips its domain step because it is not a WPCOM address — so the
		// modal must appear here too.
		mockDomains = [ wpcomDomain, connectedDomain ];

		renderBridge();

		expect( await screen.findByTestId( 'pre-launch-modal' ) ).toBeVisible();
		expect( screen.getByText( 'connected.example' ) ).toBeVisible();
		expect( assign ).not.toHaveBeenCalled();
	} );

	it( 'keeps the modal up and never redirects if a later refetch errors', async () => {
		renderBridge();
		await screen.findByTestId( 'pre-launch-modal' );

		// Simulate a background refetch (e.g. window refocus) that fails after the
		// modal is already showing. The decision must stay frozen on "modal" — a
		// redirect here would launch the site with no confirmation.
		mockDomainsError = true;
		await act( async () => {
			await queryClient.refetchQueries( { queryKey: [ 'domains' ] } );
		} );

		expect( screen.getByTestId( 'pre-launch-modal' ) ).toBeVisible();
		expect( assign ).not.toHaveBeenCalled();
	} );

	it( 'falls back to the launch flow when the domains query errors', async () => {
		mockDomainsError = true;

		renderBridge();

		await waitFor( () => expect( assign ).toHaveBeenCalledWith( LAUNCH_URL ) );
		expect( screen.queryByTestId( 'pre-launch-modal' ) ).not.toBeInTheDocument();
	} );

	it( 'falls back to the launch flow when the site query errors', async () => {
		mockSiteError = true;

		renderBridge();

		await waitFor( () => expect( assign ).toHaveBeenCalledWith( LAUNCH_URL ) );
		expect( screen.queryByTestId( 'pre-launch-modal' ) ).not.toBeInTheDocument();
	} );

	it( 'renders nothing and never redirects without a site id', async () => {
		renderBridge( { siteId: 0 } );

		// Give the effect/queries a chance to run so a missing guard would surface.
		await Promise.resolve();

		expect( screen.queryByTestId( 'pre-launch-modal' ) ).not.toBeInTheDocument();
		expect( assign ).not.toHaveBeenCalled();
	} );

	it( 'renders nothing while closed', () => {
		renderBridge( { isOpen: false } );

		expect( screen.queryByTestId( 'pre-launch-modal' ) ).not.toBeInTheDocument();
		expect( assign ).not.toHaveBeenCalled();
	} );
} );
