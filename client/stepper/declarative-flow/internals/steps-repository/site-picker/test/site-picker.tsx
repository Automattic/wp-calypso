/**
 * @jest-environment jsdom
 */
import {
	DEFAULT_SITE_LAUNCH_STATUS_GROUP_VALUE,
	GroupableSiteLaunchStatuses,
} from '@automattic/sites';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import nock from 'nock';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import SitePicker from '../site-picker';

const renderComponent = ( component: JSX.Element, initialState = {} ) => {
	const mockStore = configureStore();
	const store = mockStore( initialState );
	const queryClient = new QueryClient();

	return render(
		<Provider store={ store }>
			<QueryClientProvider client={ queryClient }>{ component }</QueryClientProvider>
		</Provider>
	);
};

describe( 'SitePicker', () => {
	// eslint-disable-next-line @typescript-eslint/no-empty-function
	const noop = () => {};

	const defaultProps = {
		page: 1,
		perPage: 96,
		search: '',
		status: DEFAULT_SITE_LAUNCH_STATUS_GROUP_VALUE as GroupableSiteLaunchStatuses,
		onCreateSite: noop,
		onSelectSite: noop,
		onQueryParamChange: noop,
	};
	const initialState = {
		sites: {
			items: {
				1: {
					ID: 1,
					name: 'A Test Site',
					URL: 'example.wordpress.com',
					plan: {
						product_slug: 'free_plan',
					},
				},
				2: {
					ID: 2,
					name: 'Another test Site',
					URL: 'test.wordpress.com',
					plan: {
						product_slug: 'free_plan',
					},
				},
				3: {
					// should not be shown
					ID: 3,
					name: 'A deleted site',
					URL: 'deleted.wordpress.com',
					is_deleted: true,
					plan: {
						product_slug: 'free_plan',
					},
				},
			},
			domains: {
				items: {
					1: [
						{
							domain: 'example.wordpress.com',
							isWPCOMDomain: true,
						},
					],
				},
			},
			plans: {
				1: {
					product_slug: 'free_plan',
				},
			},
		},
		ui: { selectedSiteId: 1 },
		preferences: {
			remoteValues: {
				'sites-sorting': 'alphabetically-asc',
			},
		},
		currentUser: {
			capabilities: {},
		},
	};

	beforeAll( () => {
		nock( 'https://public-api.wordpress.com' )
			.persist()
			.get( ( uri ) => uri.startsWith( '/rest/v1.2/me/sites' ) )
			.reply( 200, { sites: initialState.sites.items } );

		const mockIntersectionObserver = jest.fn();
		mockIntersectionObserver.mockReturnValue( {
			observe: () => null,
			unobserve: () => null,
			disconnect: () => null,
		} );
		window.IntersectionObserver = mockIntersectionObserver;
	} );

	test( 'renders with correct list of sites', () => {
		const { getByText, container } = renderComponent(
			<SitePicker { ...defaultProps } />,
			initialState
		);

		expect( getByText( 'Pick your destination' ) ).toBeInTheDocument();

		const allLinks = container.getElementsByClassName( 'components-external-link' );
		expect( allLinks.length ).toBeGreaterThan( 0 );
		expect( allLinks[ 0 ] ).toHaveAttribute( 'href', initialState.sites.items[ 1 ].URL );
	} );

	test( 'renders with correctly sorted list of sites', () => {
		const state = {
			...initialState,
			preferences: {
				remoteValues: {
					'sites-sorting': 'lastInteractedWith-desc',
				},
			},
		};

		const { container } = renderComponent( <SitePicker { ...defaultProps } />, state );

		const allLinks = container.getElementsByClassName( 'components-external-link' );
		expect( allLinks.length ).toBeGreaterThan( 0 );
		expect( allLinks[ 0 ] ).toHaveAttribute( 'href', initialState.sites.items[ 1 ].URL );
	} );

	test( 'renders without sites when not valid search term', () => {
		const props = {
			...defaultProps,
			search: 'notfound',
		};

		renderComponent( <SitePicker { ...props } />, initialState );

		expect( screen.getByText( 'No sites match your search.' ) ).toBeVisible();
	} );

	test( 'renders without sites when not valid status', () => {
		const props = {
			...defaultProps,
			status: 'private' as GroupableSiteLaunchStatuses,
		};

		renderComponent( <SitePicker { ...props } />, initialState );

		expect( screen.getByText( 'You have no private sites' ) ).toBeVisible();
	} );
} );
