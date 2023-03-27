/**
 * @jest-environment jsdom
 */
import { NEWSLETTER_FLOW } from '@automattic/onboarding';
import { render, screen } from '@testing-library/react';
import nock from 'nock';
import React from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
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
			expect( screen.getByText( "You're all set to start publishing" ) ).toBeInTheDocument();
			expect(
				screen.getByText( 'Why not welcome your readers with your first post?' )
			).toBeInTheDocument();
		} );

		it( 'renders correct sidebar tasks', () => {
			renderStepContent( false, NEWSLETTER_FLOW );

			expect( screen.getByText( 'Personalize Newsletter' ) ).toBeInTheDocument();
			expect( screen.getByText( 'Choose a Plan' ) ).toBeInTheDocument();
			expect( screen.getByText( 'Add Subscribers' ) ).toBeInTheDocument();
			expect( screen.getByText( 'Confirm Email (Check Your Inbox)' ) ).toBeInTheDocument();
			expect( screen.getByRole( 'button', { name: 'Write your first post' } ) ).toBeInTheDocument();
		} );

		it( 'renders correct status for each task', () => {
			renderStepContent( false, NEWSLETTER_FLOW );

			const personalizeListItem = screen.getByText( 'Personalize Newsletter' ).closest( 'li' );
			const choosePlanListItem = screen.getByText( 'Choose a Plan' ).closest( 'li' );
			const addSubscribersListItem = screen.getByText( 'Add Subscribers' ).closest( 'li' );
			const confirmEmailListItem = screen
				.getByText( 'Confirm Email (Check Your Inbox)' )
				.closest( 'li' );
			const firstPostListItem = screen
				.getByRole( 'button', { name: 'Write your first post' } )
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
			expect( screen.getByText( 'Edit design' ) ).toBeInTheDocument();
		} );
	} );
} );
