/**
 * @jest-environment jsdom
 */
import { render, screen, waitFor } from '@testing-library/react';
import PreLaunchSiteModal from '../index';

let mockSite: unknown;
let mockDomains: unknown;
let mockDomainsError = false;
let mockIsPaid = true;

jest.mock( '@automattic/api-queries', () => ( {
	// eslint-disable-next-line @typescript-eslint/no-require-imports
	queryClient: new ( require( '@tanstack/react-query' ).QueryClient )( {
		defaultOptions: { queries: { retry: false } },
	} ),
	siteByIdQuery: ( siteId: number ) => ( {
		queryKey: [ 'site', siteId ],
		queryFn: async () => mockSite,
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

jest.mock( '@automattic/site-launch-modals', () => ( {
	__esModule: true,
	PreLaunchModal: ( { siteName, siteDomain, planName }: Record< string, string > ) => (
		<div data-testid="pre-launch-modal">
			<span>{ siteName }</span>
			<span>{ siteDomain }</span>
			<span>{ planName }</span>
		</div>
	),
} ) );

const customDomain = { blog_id: 1, domain: 'example.com', subscription_id: 42 };
const wpcomDomain = { blog_id: 1, domain: 'example.wordpress.com', subscription_id: null };

describe( 'PreLaunchSiteModal', () => {
	const assign = jest.fn();

	beforeEach( () => {
		jest.clearAllMocks();
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
		mockDomains = [ customDomain ];
		mockDomainsError = false;
		mockIsPaid = true;
	} );

	it( 'shows the modal for a paid plan + custom domain site', async () => {
		render(
			<PreLaunchSiteModal
				siteId={ 1 }
				isOpen
				onClose={ jest.fn() }
				launchUrl="/start/launch-site?siteSlug=example.wordpress.com"
			/>
		);

		expect( await screen.findByTestId( 'pre-launch-modal' ) ).toBeVisible();
		expect( screen.getByText( 'My Site' ) ).toBeVisible();
		expect( screen.getByText( 'example.com' ) ).toBeVisible();
		expect( assign ).not.toHaveBeenCalled();
	} );

	it( 'redirects straight to the launch flow when the plan is not paid', async () => {
		mockIsPaid = false;

		render(
			<PreLaunchSiteModal
				siteId={ 1 }
				isOpen
				onClose={ jest.fn() }
				launchUrl="/start/launch-site?siteSlug=example.wordpress.com"
			/>
		);

		await waitFor( () =>
			expect( assign ).toHaveBeenCalledWith( '/start/launch-site?siteSlug=example.wordpress.com' )
		);
		expect( screen.queryByTestId( 'pre-launch-modal' ) ).not.toBeInTheDocument();
	} );

	it( 'redirects when the site has no custom domain', async () => {
		mockDomains = [ wpcomDomain ];

		render(
			<PreLaunchSiteModal
				siteId={ 1 }
				isOpen
				onClose={ jest.fn() }
				launchUrl="/start/launch-site?siteSlug=example.wordpress.com"
			/>
		);

		await waitFor( () => expect( assign ).toHaveBeenCalled() );
		expect( screen.queryByTestId( 'pre-launch-modal' ) ).not.toBeInTheDocument();
	} );

	it( 'falls back to the launch flow when the domains query errors', async () => {
		mockDomainsError = true;

		render(
			<PreLaunchSiteModal
				siteId={ 1 }
				isOpen
				onClose={ jest.fn() }
				launchUrl="/start/launch-site?siteSlug=example.wordpress.com"
			/>
		);

		await waitFor( () => expect( assign ).toHaveBeenCalled() );
		expect( screen.queryByTestId( 'pre-launch-modal' ) ).not.toBeInTheDocument();
	} );

	it( 'renders nothing while closed', () => {
		render(
			<PreLaunchSiteModal
				siteId={ 1 }
				isOpen={ false }
				onClose={ jest.fn() }
				launchUrl="/start/launch-site?siteSlug=example.wordpress.com"
			/>
		);

		expect( screen.queryByTestId( 'pre-launch-modal' ) ).not.toBeInTheDocument();
		expect( assign ).not.toHaveBeenCalled();
	} );
} );
