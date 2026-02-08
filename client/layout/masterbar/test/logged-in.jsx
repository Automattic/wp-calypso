/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import MasterbarLoggedIn from '../logged-in';

// Mock heavy or unrelated child components to keep the test focused.
jest.mock( 'calypso/components/async-load', () => () => null );
jest.mock( '../masterbar-notifications/notifications-button', () => () => (
	<div data-testid="notifications" />
) );
jest.mock( 'calypso/components/gravatar', () => ( { user } ) => (
	<div data-testid="gravatar" data-user={ user?.display_name } />
) );

const mockStore = configureStore();

function getBaseState( userOverride ) {
	return {
		ui: {
			section: { group: 'sites' },
			selectedSiteId: 1,
			layoutFocus: { current: 'content' },
			route: { path: { current: '/home' } },
		},
		currentUser: {
			id: userOverride === null ? null : 1,
			capabilities: { 1: { manage_options: true } },
			user:
				userOverride === null
					? null
					: userOverride ?? {
							ID: 1,
							display_name: 'Test User',
							username: 'testuser',
							email: 'test@example.com',
							primary_blog: 1,
							primary_blog_url: 'https://example.wordpress.com',
							site_count: 1,
							visible_site_count: 1,
					  },
		},
		sites: {
			items: {
				1: {
					ID: 1,
					URL: 'https://example.wordpress.com',
					title: 'Test Site',
					plan: { product_slug: 'free_plan' },
					options: {},
				},
			},
			plans: { 1: {} },
			domains: { items: {} },
			connection: { items: {} },
		},
		preferences: {
			remoteValues: {},
			localValues: {},
		},
		purchases: { data: [] },
		productsList: { items: {} },
		siteSettings: { items: {} },
		media: { queries: {} },
		adminMenu: {},
		support: { isSupportSession: false },
		route: { path: { current: '/home' }, query: { current: {} } },
	};
}

function renderMasterbar( stateOverrides = {} ) {
	const state = { ...getBaseState( stateOverrides.user ), ...stateOverrides };
	const store = mockStore( state );

	return render(
		<Provider store={ store }>
			<MasterbarLoggedIn
				section="my-sites"
				setNextLayoutFocus={ jest.fn() }
				activateNextLayoutFocus={ jest.fn() }
				loadHelpCenterIcon={ false }
			/>
		</Provider>
	);
}

describe( 'MasterbarLoggedIn', () => {
	describe( 'renderProfileMenu', () => {
		it( 'should render the profile menu when user is available', () => {
			renderMasterbar();
			expect( screen.getByText( /Howdy/ ) ).toBeVisible();
		} );

		it( 'should not crash when user is null', () => {
			renderMasterbar( { user: null } );
			expect( screen.queryByText( /Howdy/ ) ).not.toBeInTheDocument();
		} );
	} );
} );
