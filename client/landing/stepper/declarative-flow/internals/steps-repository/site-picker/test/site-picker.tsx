/**
 * @jest-environment jsdom
 */
import {
	DEFAULT_SITE_LAUNCH_STATUS_GROUP_VALUE,
	GroupableSiteLaunchStatuses,
} from '@automattic/sites';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import preferencesReducer from 'calypso/state/preferences/reducer';
import SitePickerStep from '..';
import { recordStepNavigation } from '../../../analytics/record-step-navigation';
import { useStepNavigationWithTracking } from '../../../hooks/use-step-navigation-with-tracking';
import { mockStepProps, renderStep } from '../../test/helpers';
import SitePicker from '../site-picker';
import type { Flow } from '../../../types';
import type { JSX } from 'react';

jest.mock( 'calypso/lib/analytics/tracks' );
jest.mock( '../../../analytics/record-step-navigation' );

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

	const renderTrackedPicker = ( initialEntry = '/site-migration/sitePicker' ) => {
		const submit = jest.fn();
		const flow: Flow = {
			name: 'site-migration',
			isSignupFlow: false,
			useSteps: () => [],
			useStepNavigation: () => ( { submit } ),
		};
		const TrackedPicker = () => {
			const navigation = useStepNavigationWithTracking( {
				flow,
				currentStepRoute: 'sitePicker',
				navigate: noop,
			} );
			return <SitePickerStep { ...mockStepProps() } navigation={ navigation } />;
		};
		renderStep( <TrackedPicker />, {
			initialEntry,
			initialState,
			reducers: { preferences: preferencesReducer },
		} );
		jest.mocked( recordTracksEvent ).mockClear();
		jest.mocked( recordStepNavigation ).mockClear();
		submit.mockClear();
		return submit;
	};

	test( 'clearing search updates the flow and records only the dedicated filter event', async () => {
		const submit = renderTrackedPicker( '/site-migration/sitePicker?search=notfound&page=3' );

		await userEvent.click( screen.getByRole( 'button', { name: 'Close Search' } ) );
		await waitFor( () =>
			expect( submit ).toHaveBeenCalledWith(
				expect.objectContaining( {
					action: 'update-query',
					queryParams: { search: '', page: undefined },
				} )
			)
		);
		expect( recordTracksEvent ).toHaveBeenCalledWith(
			'calypso_import_site_picker_query_param_change',
			{ search: '', page: undefined }
		);
		expect( recordStepNavigation ).not.toHaveBeenCalled();
	} );

	test( 'confirming a destination updates the flow and records only the dedicated selection event', async () => {
		const submit = renderTrackedPicker();
		await userEvent.click( screen.getAllByRole( 'button', { name: 'Select this site' } )[ 0 ] );
		await userEvent.click( screen.getByRole( 'button', { name: 'Continue' } ) );
		await waitFor( () =>
			expect( submit ).toHaveBeenCalledWith(
				expect.objectContaining( {
					action: 'select-site',
					site: expect.objectContaining( { ID: 1 } ),
				} )
			)
		);
		expect( recordTracksEvent ).toHaveBeenCalledWith( 'calypso_import_site_picker_select_site', {
			id: 1,
			slug: 'example.wordpress.com',
			title: 'A Test Site',
		} );
		expect( recordStepNavigation ).not.toHaveBeenCalled();
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
