/**
 * @jest-environment jsdom
 */
// @ts-nocheck - TODO: Fix TypeScript issues
import { screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import apiFetch from '@wordpress/api-fetch';
import React from 'react';
import { reducer as ui } from 'calypso/state/ui/reducer';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import CustomerHomeLaunchPad from '../';

const sites = [
	{},
	{
		ID: 1,
		URL: 'example.wordpress.com',
		plan: {
			product_slug: 'free_plan',
		},
		options: {},
	},
];

const initialState = {
	sites: {
		items: sites,
		domains: {
			items: [ 'example.wordpress.com' ],
		},
	},
	ui: {
		selectedSiteId: 1,
	},
	currentUser: {
		id: 12,
		user: {
			email_verified: true,
		},
	},
};

// Due to an unknown issue, the following mock is required to <prevent> the following error:
// TypeError: (0 , _wpcomProxyRequest.canAccessWpcomApis) is not a function
// Probably there is a test leaking a mock or something like that.
jest.mock( 'wpcom-proxy-request', () => ( {
	...jest.requireActual( 'wpcom-proxy-request' ),
} ) );

jest.mock( '@wordpress/api-fetch' );

jest.mock( 'calypso/components/pre-launch-site-modal', () => ( {
	__esModule: true,
	default: ( { isOpen, launchUrl } ) =>
		isOpen ? <div data-testid="pre-launch-modal">{ launchUrl }</div> : null,
} ) );

const render = ( el, state = initialState ) => {
	return renderWithProvider( el, {
		initialState: state,
		reducers: { ui },
	} );
};

const DEFAULT_TAKS_RESPONSE = {
	site_intent: 'build',
	launchpad_screen: 'off',
	checklist_statuses: {
		design_completed: true,
		site_theme_selected: true,
		site_launched: true,
		site_edited: true,
	},
	checklist: [
		{
			id: 'setup_general',
			title: 'Task 1',
			completed: false,
			disabled: true,
			subtitle: '',
			badge_text: '',
			isLaunchTask: false,
			calypso_path: '/settings/general/gabrielcaires0.wordpress.com',
		},
		{
			id: 'design_selected',
			title: 'Task 2',
			completed: true,
			disabled: false,
			subtitle: '',
			badge_text: '',
			isLaunchTask: false,
			calypso_path: '/setup/update-design/design-setup?siteSlug=gabrielcaires0.wordpress.com',
		},
	],
	is_enabled: false,
	is_dismissed: false,
	is_dismissible: true,
	title: 'Some cool title for you task list',
};

describe( 'CustomerHomeLaunchPad', () => {
	beforeAll( () => {
		jest.mocked( apiFetch ).mockResolvedValue( DEFAULT_TAKS_RESPONSE );
	} );

	it( 'renders the launchpad title', async () => {
		render( <CustomerHomeLaunchPad checklistSlug="some-check-list" /> );

		expect( await screen.findByText( 'Some cool title for you task list' ) ).toBeVisible();
	} );

	it( 'renders the task list', async () => {
		render( <CustomerHomeLaunchPad checklistSlug="some-check-list" /> );

		expect( await screen.findByText( 'Task 1' ) ).toBeVisible();
		expect( await screen.findByText( 'Task 2' ) ).toBeVisible();
	} );

	it( 'dismiss the launchpad using the dismiss settings menu', async () => {
		render( <CustomerHomeLaunchPad checklistSlug="some-check-list" /> );
		userEvent.click( await screen.findByTitle( 'Dismiss settings' ) );

		const hideForever = await screen.findByText( 'Hide forever' );
		await act( async () => {
			await userEvent.click( hideForever );
		} );
		await waitFor( () =>
			expect( screen.queryByText( 'Some cool title for you task list' ) ).not.toBeInTheDocument()
		);
	} );

	describe( 'when the launchpad was previously dismissed', () => {
		it( "doesn't renders the launchpad", () => {
			const data = {
				...DEFAULT_TAKS_RESPONSE,
				is_dismissable: true,
			};
			jest.mocked( apiFetch ).mockResolvedValueOnce( data );

			render( <CustomerHomeLaunchPad checklistSlug="some-check-list" /> );

			expect( screen.queryByText( 'Some cool title for you task list' ) ).not.toBeInTheDocument();
		} );
	} );

	describe( 'when all tasks are completed', () => {
		const data = {
			...DEFAULT_TAKS_RESPONSE,
			checklist: [
				{
					id: 'setup_general',
					title: 'Task 1',
					completed: true,
					disabled: true,
					subtitle: '',
					badge_text: '',
					isLaunchTask: false,
					calypso_path: '/settings/general/gabrielcaires0.wordpress.com',
				},
			],
		};

		beforeEach( () => {
			jest.mocked( apiFetch ).mockResolvedValueOnce( data );
		} );

		it( "doesn't renders skip button", async () => {
			render( <CustomerHomeLaunchPad checklistSlug="some-check-list" /> );

			expect( await screen.queryByTitle( 'Dismiss settings' ) ).not.toBeInTheDocument();
		} );

		it( 'renders the dismiss button', async () => {
			render( <CustomerHomeLaunchPad checklistSlug="some-check-list" /> );

			expect( await screen.findByText( /Dismiss guide/ ) ).toBeVisible();
		} );

		it( 'hides the card when the user clicks on the dismiss guide button', async () => {
			render( <CustomerHomeLaunchPad checklistSlug="some-check-list" /> );

			// Wait for the click event to be fully resolved.
			await userEvent.click( await screen.findByText( /Dismiss guide/ ) );

			expect( screen.queryByText( 'Some cool title for you task list' ) ).not.toBeInTheDocument();
		} );
	} );

	describe( 'when the launchpad is NOT dismissible', () => {
		const dismissibleTask = {
			...DEFAULT_TAKS_RESPONSE,
			is_dismissed: false,
		};

		beforeAll( () => {
			jest.mocked( apiFetch ).mockResolvedValue( dismissibleTask );
		} );

		it( 'renders the dismiss settings menu when the tasks are not completed', () => {
			render( <CustomerHomeLaunchPad checklistSlug="some-check-list" /> );

			expect( screen.queryByTitle( 'Dismiss settings' ) ).not.toBeInTheDocument();
		} );
	} );

	describe( 'when a launch task is clicked', () => {
		const LAUNCH_URL = '/start/launch-site?siteSlug=example.wordpress.com';
		const assign = jest.fn();

		const launchTask = {
			id: 'site_launched',
			title: 'Launch your site',
			completed: false,
			disabled: false,
			subtitle: '',
			badge_text: '',
			isLaunchTask: true,
		};

		const stateWithPlan = ( plan ) => ( {
			...initialState,
			sites: {
				...initialState.sites,
				items: [ {}, { ...sites[ 1 ], plan } ],
			},
		} );

		beforeEach( () => {
			assign.mockClear();
			Object.defineProperty( window, 'location', {
				configurable: true,
				value: { assign, href: 'https://wordpress.com/home/example.wordpress.com' },
			} );
			jest.mocked( apiFetch ).mockResolvedValue( {
				...DEFAULT_TAKS_RESPONSE,
				checklist: [ launchTask ],
			} );
		} );

		it( 'sends a free site straight to the launch flow', async () => {
			render(
				<CustomerHomeLaunchPad checklistSlug="some-check-list" />,
				stateWithPlan( { product_slug: 'free_plan', is_free: true } )
			);

			await userEvent.click( await screen.findByText( 'Launch your site' ) );

			expect( assign ).toHaveBeenCalledWith( LAUNCH_URL );
			expect( screen.queryByTestId( 'pre-launch-modal' ) ).not.toBeInTheDocument();
		} );

		it( 'opens the pre-launch modal for a paid site', async () => {
			render(
				<CustomerHomeLaunchPad checklistSlug="some-check-list" />,
				stateWithPlan( { product_slug: 'business-bundle', is_free: false } )
			);

			await userEvent.click( await screen.findByText( 'Launch your site' ) );

			expect( await screen.findByTestId( 'pre-launch-modal' ) ).toHaveTextContent( LAUNCH_URL );
			expect( assign ).not.toHaveBeenCalled();
		} );

		it( 'also gates the blog_launched task', async () => {
			jest.mocked( apiFetch ).mockResolvedValue( {
				...DEFAULT_TAKS_RESPONSE,
				checklist: [ { ...launchTask, id: 'blog_launched', title: 'Launch your blog' } ],
			} );
			render(
				<CustomerHomeLaunchPad checklistSlug="some-check-list" />,
				stateWithPlan( { product_slug: 'business-bundle', is_free: false } )
			);

			await userEvent.click( await screen.findByText( 'Launch your blog' ) );

			expect( await screen.findByTestId( 'pre-launch-modal' ) ).toBeVisible();
		} );

		it( 'lets a caller onTaskClick that returns false stop the launch gate', async () => {
			const onTaskClick = jest.fn( () => false );
			render(
				<CustomerHomeLaunchPad checklistSlug="some-check-list" onTaskClick={ onTaskClick } />,
				stateWithPlan( { product_slug: 'business-bundle', is_free: false } )
			);

			await userEvent.click( await screen.findByText( 'Launch your site' ) );

			expect( onTaskClick ).toHaveBeenCalledTimes( 1 );
			expect( screen.queryByTestId( 'pre-launch-modal' ) ).not.toBeInTheDocument();
			expect( assign ).not.toHaveBeenCalled();
		} );
	} );
} );
