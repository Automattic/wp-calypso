/**
 * @jest-environment jsdom
 */
import { updateLaunchpadSettings } from '@automattic/data-stores';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, render, screen, waitFor } from '@testing-library/react';
import nock from 'nock';
import React from 'react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import CelebrateSiteLaunchModal from 'calypso/my-sites/customer-home/celebrate-site-launch-modal';
import HomeContent from '../index';

jest.mock( '@automattic/data-stores', () => ( {
	...jest.requireActual( '@automattic/data-stores' ),
	updateLaunchpadSettings: jest.fn().mockResolvedValue( {} ),
} ) );

jest.mock( '../../full-screen-launchpad', () => ( {
	// @ts-expect-error - TODO: Fix TypeScript issues
	FullScreenLaunchpad: ( { onClose, onSiteLaunch, beforeSiteLaunchRefetch } ) => (
		<div data-testid="full-screen-launchpad">
			<button onClick={ onClose }>Skip to dashboard</button>
			<button
				onClick={ () => {
					beforeSiteLaunchRefetch?.();
					onSiteLaunch();
				} }
			>
				Launch your site
			</button>
		</div>
	),
} ) );

jest.mock( 'calypso/components/resurrected-welcome-modal', () => () => null );

const testSite = {
	ID: 1,
	slug: 'test-site',
	launch_status: 'launched',
	plan: { is_free: true, product_slug: 'free_plan' },
	options: {
		site_creation_flow: 'onboarding',
	},
};

let mockLayoutViewName = '';
const mockLayout = { view_name: mockLayoutViewName };

const mockDomainsApi = ( domains: unknown[] = [] ) => {
	nock( 'https://public-api.wordpress.com' )
		.get( '/rest/v1.2/all-domains' )
		.query( true )
		.reply( 200, { domains } );
};

jest.mock( 'calypso/data/home/use-home-layout-query', () => {
	const getCacheKey = ( siteId: number ) => [ 'home-layout', siteId ];
	return {
		__esModule: true,
		default: function () {
			return {
				data: mockLayout,
			};
		},
		getCacheKey,
	};
} );

describe( 'HomeContent', () => {
	const queryClient = new QueryClient();
	const mockStore = configureStore();
	const store = mockStore( {
		sites: {
			items: {
				[ testSite.ID ]: testSite,
			},
			plans: {
				items: [],
			},
			domains: {
				items: [],
			},
		},
		currentUser: {
			id: 1,
			user: {
				had_hosting_trial: false,
			},
			capabilities: {
				[ testSite.ID ]: {
					edit_posts: true,
				},
			},
		},
		plugins: {
			installed: {
				items: [],
				isRequesting: false,
				plugins: [],
			},
		},
		jetpack: {
			modules: {
				fetching: false,
			},
			items: [],
		},
		ui: {
			selectedSiteId: testSite.ID,
		},
		userSettings: {},
	} );

	const renderWithProviders = ( children: React.ReactNode ) => {
		return render(
			<Provider store={ store }>
				<QueryClientProvider client={ queryClient }>{ children }</QueryClientProvider>
			</Provider>
		);
	};

	beforeEach( () => {
		queryClient.clear();
		mockLayout.view_name = mockLayoutViewName;
		nock.cleanAll();
		mockDomainsApi( [] );
		const url = new URL( window.location.href );
		url.search = '';
		window.history.replaceState( {}, '', url.pathname + url.search );
	} );

	afterEach( () => {
		nock.cleanAll();
	} );

	describe( 'Focused Launchpad integration', () => {
		describe( 'Disabled state', () => {
			it( 'should not show FullScreenLaunchpad for launched sites', async () => {
				mockLayoutViewName = 'CELEBRATE_LAUNCH';
				renderWithProviders( <HomeContent /> );
				await waitFor( () => {
					expect( screen.queryByTestId( 'full-screen-launchpad' ) ).not.toBeInTheDocument();
				} );
				mockLayoutViewName = 'VIEW_FOCUSED_LAUNCHPAD';
			} );
		} );

		describe( 'Enabled states', () => {
			it( 'should show FullScreenLaunchpad for valid unlaunched sites with onboarding flow', async () => {
				mockLayoutViewName = 'VIEW_FOCUSED_LAUNCHPAD';
				await act( async () => {
					renderWithProviders( <HomeContent /> );
				} );

				await waitFor( () => {
					expect( screen.getByTestId( 'full-screen-launchpad' ) ).toBeInTheDocument();
				} );
			} );

			it( 'should update launchpad settings and hide FullScreenLaunchpad when skipping', async () => {
				mockLayoutViewName = 'VIEW_FOCUSED_LAUNCHPAD';
				const mockUpdateLaunchpad = jest.mocked( updateLaunchpadSettings );

				await act( async () => {
					renderWithProviders( <HomeContent /> );
				} );

				await waitFor( () => {
					expect( screen.getByTestId( 'full-screen-launchpad' ) ).toBeInTheDocument();
				} );

				const skipButton = screen.getByText( 'Skip to dashboard' );
				await act( async () => {
					skipButton.click();
				} );

				expect( mockUpdateLaunchpad ).toHaveBeenCalledWith( 1, {
					launchpad_screen: 'skipped',
				} );

				await waitFor( () => {
					expect( screen.queryByTestId( 'full-screen-launchpad' ) ).not.toBeInTheDocument();
				} );
			} );

			it( 'should show celebrate launch modal when site is launched', async () => {
				mockLayoutViewName = 'VIEW_FOCUSED_LAUNCHPAD';
				window.history.pushState( {}, '', '/home?celebrateLaunch=true' );
				renderWithProviders(
					<>
						<HomeContent />
						<CelebrateSiteLaunchModal siteId={ testSite.ID } />
					</>
				);

				const launchButton = screen.getByText( 'Launch your site' );
				await act( async () => {
					launchButton.click();
				} );

				expect( await screen.findByText( 'Congrats, your site is live!' ) ).toBeInTheDocument();

				expect( screen.queryByTestId( 'full-screen-launchpad' ) ).not.toBeInTheDocument();
			} );
		} );
	} );
} );
