/**
 * @jest-environment jsdom
 */
import { useLaunchpad } from '@automattic/data-stores';
import { NEWSLETTER_FLOW, START_WRITING_FLOW } from '@automattic/onboarding';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import nock from 'nock';
import React from 'react';
import { Provider } from 'react-redux';
import { createReduxStore } from 'calypso/state';
import { getInitialState, getStateFromCache } from 'calypso/state/initial-state';
import initialReducer from 'calypso/state/reducer';
import { setStore } from 'calypso/state/redux-store';
import StepContent from '../step-content';
import { defaultSiteDetails } from './lib/fixtures';

const mockSite = defaultSiteDetails;
const siteSlug = 'testlinkinbio.wordpress.com';

const stepContentProps = {
	siteSlug,
	/* eslint-disable @typescript-eslint/no-empty-function */
	submit: () => {},
	goNext: () => {},
	goToStep: () => {},
	/* eslint-enable @typescript-eslint/no-empty-function */
};

jest.mock( '@automattic/data-stores', () => ( {
	...jest.requireActual( '@automattic/data-stores' ),
	useLaunchpad: jest.fn().mockReturnValue( {
		data: { site_intent: 'newsletter' },
	} ),
} ) );

jest.mock( 'calypso/landing/stepper/hooks/use-site', () => ( {
	useSite: () => ( {
		site: mockSite,
	} ),
} ) );

jest.mock( 'react-router-dom', () => ( {
	...jest.requireActual( 'react-router-dom' ),
	useLocation: jest.fn().mockImplementation( () => ( {
		pathname: '/setup/launchpad',
		search: `?flow=newsletter&siteSlug=testlinkinbio.wordpress.com`,
		hash: '',
		state: undefined,
	} ) ),
} ) );

jest.mock( 'calypso/../packages/help-center/src/hooks/use-launchpad-checklist', () => ( {
	useLaunchpadChecklist: ( siteSlug, siteIntentOption ) => {
		let checklist = [
			{
				id: 'setup_newsletter',
				completed: true,
				disabled: false,
				title: 'Personalize newsletter',
			},
			{ id: 'plan_selected', completed: true, disabled: false, title: 'Choose a plan' },
			{ id: 'subscribers_added', completed: true, disabled: true, title: 'Add subscribers' },
			{
				id: 'verify_email',
				completed: true,
				disabled: true,
				title: 'Confirm email (check your inbox)',
			},
			{
				id: 'first_post_published_newsletter',
				completed: true,
				disabled: true,
				title: 'Start writing',
			},
		];

		if ( siteIntentOption === 'start-writing' ) {
			checklist = [
				{
					id: 'first_post_published',
					completed: true,
					disabled: false,
					title: 'Write your first post',
				},
				{ id: 'setup_free', completed: true, disabled: false, title: 'Choose a plan' },
				{ id: 'domain_upsell', completed: false, disabled: false, title: 'Choose a domain' },
				{
					id: 'plan_selected',
					completed: false,
					disabled: false,
					title: 'Choose a plan',
				},
				{
					id: 'blog_launched',
					completed: false,
					disabled: false,
					title: 'Launch your blog',
				},
			];
		}

		return {
			data: { checklist },
			isFetchedAfterMount: true,
		};
	},
} ) );

const user = {
	ID: 1234,
	username: 'testUser',
	email: 'testemail@wordpress.com',
	email_verified: false,
};

function renderStepContent( emailVerified = false, flow: string ) {
	const initialState = getInitialState( initialReducer, user.ID );
	const reduxStore = createReduxStore(
		{
			...initialState,
			currentUser: {
				user: {
					...user,
					email_verified: emailVerified,
				},
			},
		},
		initialReducer
	);
	setStore( reduxStore, getStateFromCache( user.ID ) );
	const queryClient = new QueryClient();

	render(
		<Provider store={ reduxStore }>
			<QueryClientProvider client={ queryClient }>
				<StepContent { ...stepContentProps } flow={ flow } />
			</QueryClientProvider>
		</Provider>
	);
}

describe( 'StepContent', () => {
	beforeEach( () => {
		nock( 'https://public-api.wordpress.com' )
			.get( `/wpcom/v2/sites/${ siteSlug }/launchpad` )
			.reply( 200, {
				checklist_statuses: {},
				launchpad_screen: 'full',
				site_intent: '',
			} );
	} );

	afterEach( () => {
		nock.cleanAll();
	} );

	// To get things started, test basic rendering for Newsletter flow
	// In future, we can add additional flows and test interactivity of items
	describe( 'when flow is Newsletter', () => {
		it( 'renders correct sidebar header content', () => {
			renderStepContent( false, NEWSLETTER_FLOW );

			expect( screen.getByText( 'Newsletter' ) ).toBeInTheDocument();
			expect( screen.getByText( "Your newsletter's ready!" ) ).toBeInTheDocument();
			expect( screen.getByText( 'Now it’s time to let your readers know.' ) ).toBeInTheDocument();
		} );

		it( 'renders correct sidebar tasks', () => {
			renderStepContent( false, NEWSLETTER_FLOW );

			expect( screen.getByText( 'Personalize newsletter' ) ).toBeInTheDocument();
			expect( screen.getByText( 'Choose a plan' ) ).toBeInTheDocument();
			expect( screen.getByText( 'Add subscribers' ) ).toBeInTheDocument();
			expect( screen.getByText( 'Confirm email (check your inbox)' ) ).toBeInTheDocument();
			expect( screen.getByRole( 'button', { name: 'Start writing' } ) ).toBeInTheDocument();
		} );

		it( 'renders correct status for each task', () => {
			renderStepContent( false, NEWSLETTER_FLOW );

			const personalizeListItem = screen.getByText( 'Personalize newsletter' ).closest( 'li' );
			const choosePlanListItem = screen.getByText( 'Choose a plan' ).closest( 'li' );
			const addSubscribersListItem = screen.getByText( 'Add subscribers' ).closest( 'li' );
			const confirmEmailListItem = screen
				.getByText( 'Confirm email (check your inbox)' )
				.closest( 'li' );
			const firstPostListItem = screen
				.getByRole( 'button', { name: 'Start writing' } )
				.closest( 'li' );

			expect( personalizeListItem ).toHaveClass( 'completed' );
			expect( choosePlanListItem ).toHaveClass( 'completed' );
			expect( addSubscribersListItem ).toHaveClass( 'completed' );
			expect( confirmEmailListItem ).toHaveClass( 'pending' );
			expect( firstPostListItem ).toHaveClass( 'pending' );
		} );

		it( 'renders skip to dashboard link', () => {
			renderStepContent( false, NEWSLETTER_FLOW );

			expect( screen.getByRole( 'button', { name: 'Skip to dashboard' } ) ).toBeInTheDocument();
		} );

		it( 'renders web preview section', () => {
			renderStepContent( false, NEWSLETTER_FLOW );

			expect( screen.getByTitle( 'Preview' ) ).toBeInTheDocument();
		} );
	} );

	describe( 'when flow is Start writing', () => {
		it( 'renders correct sidebar header content', () => {
			renderStepContent( false, START_WRITING_FLOW );

			expect( screen.getByText( "Your blog's almost ready!" ) ).toBeInTheDocument();
			expect(
				screen.getByText( 'Keep up the momentum with these final steps.' )
			).toBeInTheDocument();
		} );

		it( 'renders correct sidebar tasks', () => {
			// Change the useLaunchpad hook to return a free site.
			( useLaunchpad as jest.Mock ).mockReturnValueOnce( {
				data: {
					site_intent: 'start-writing',
				},
			} );
			renderStepContent( false, START_WRITING_FLOW );

			expect( screen.getByText( 'Write your first post' ) ).toBeInTheDocument();
			expect( screen.getByText( 'Choose a domain' ) ).toBeInTheDocument();
			expect( screen.getByText( 'Choose a plan' ) ).toBeInTheDocument();
			expect( screen.getByText( 'Launch your blog' ) ).toBeInTheDocument();
		} );

		it( 'renders correct status for each task', () => {
			renderStepContent( false, START_WRITING_FLOW );

			const choosePlanListItem = screen.getByText( 'Choose a plan' ).closest( 'li' );
			expect( choosePlanListItem ).toHaveClass( 'pending' );
		} );

		it( 'renders web preview section', () => {
			renderStepContent( false, START_WRITING_FLOW );

			expect( screen.getByTitle( 'Preview' ) ).toBeInTheDocument();
		} );
	} );
} );
