/**
 * @jest-environment jsdom
 */
// @ts-nocheck - TODO: Fix TypeScript issues
import { updateLaunchpadSettings } from '@automattic/data-stores';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import HomeContent from '../index';

jest.mock( '@automattic/data-stores', () => ( {
	...jest.requireActual( '@automattic/data-stores' ),
	updateLaunchpadSettings: jest.fn().mockResolvedValue( {} ),
} ) );

// Add this mock for FullScreenLaunchpad
jest.mock( '../../full-screen-launchpad', () => ( {
	FullScreenLaunchpad: ( { onClose, onSiteLaunch } ) => (
		<div data-testid="full-screen-launchpad">
			<button onClick={ onClose }>Skip to dashboard</button>
			<button onClick={ onSiteLaunch }>Launch your site</button>
		</div>
	),
} ) );

const testSite = {
	ID: 1,
	slug: 'test-site',
	options: {
		site_creation_flow: 'onboarding',
	},
};

let mockLayoutViewName = '';
const mockLayout = { view_name: mockLayoutViewName };

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
				renderWithProviders( <HomeContent /> );

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
