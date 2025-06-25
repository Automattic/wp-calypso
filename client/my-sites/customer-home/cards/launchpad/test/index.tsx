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

const render = ( el ) => {
	return renderWithProvider( el, {
		initialState,
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
} );
