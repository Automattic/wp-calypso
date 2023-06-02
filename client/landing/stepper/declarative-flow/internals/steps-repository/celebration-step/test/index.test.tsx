/**
 * @jest-environment jsdom
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';
import { createReduxStore } from 'calypso/state';
import { getInitialState, getStateFromCache } from 'calypso/state/initial-state';
import initialReducer from 'calypso/state/reducer';
import { setStore } from 'calypso/state/redux-store';
import { defaultSiteDetails } from '../../launchpad/test/lib/fixtures';
import CelebrationStep from '../index';

const mockSite = {
	...defaultSiteDetails,
	options: {
		...defaultSiteDetails.options,
		site_intent: '',
	},
};

const siteSlug = 'testcelebrationscreen.wordpress.com';

const stepContentProps = {
	siteSlug,
	/* eslint-disable @typescript-eslint/no-empty-function */
	submit: () => {},
	goNext: () => {},
	goToStep: () => {},
	/* eslint-enable @typescript-eslint/no-empty-function */
};

jest.mock( 'calypso/landing/stepper/hooks/use-site', () => ( {
	useSite: () => mockSite,
} ) );

let mockIsFirstPostPublished = false;

jest.mock( '@automattic/data-stores', () => ( {
	...jest.requireActual( '@automattic/data-stores' ),
	useLaunchpad: () => {
		return {
			data: {
				checklist_statuses: {
					first_post_published: mockIsFirstPostPublished,
				},
			},
		};
	},
} ) );

jest.mock( 'react-router-dom', () => ( {
	...jest.requireActual( 'react-router-dom' ),
	useLocation: jest.fn().mockImplementation( () => ( {
		pathname: '/setup/design-first',
		search: `?siteSlug=testcelebrationscreen.wordpress.com`,
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

const navigation = {
	goBack: jest.fn(),
	goNext: jest.fn(),
	submit: jest.fn(),
};

function renderCelebrationScreen() {
	const initialState = getInitialState( initialReducer, user.ID );
	const reduxStore = createReduxStore(
		{
			...initialState,
			currentUser: {
				user: {
					...user,
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
				<CelebrationStep { ...stepContentProps } flow="site-setup" navigation={ navigation } />
			</QueryClientProvider>
		</Provider>
	);
}

describe( 'StepContent', () => {
	describe( 'when the celebration screen is ready', () => {
		it( 'renders correct content and CTAs when first post is NOT published', () => {
			mockIsFirstPostPublished = false;
			renderCelebrationScreen();

			expect( screen.getByText( 'Your blog’s ready!' ) ).toBeInTheDocument();
			expect( screen.getByTitle( 'Preview' ) ).toBeInTheDocument();
			expect( screen.getByText( 'Now it’s time to start posting.' ) ).toBeInTheDocument();

			expect( screen.getByRole( 'link', { name: 'Visit your blog' } ) ).toBeInTheDocument();
			expect( screen.getByRole( 'link', { name: 'Visit your blog' } ) ).toHaveAttribute(
				'href',
				'https://' + siteSlug
			);

			expect( screen.getByRole( 'link', { name: 'Write your first post' } ) ).toBeInTheDocument();
			expect( screen.getByRole( 'link', { name: 'Write your first post' } ) ).toHaveAttribute(
				'href',
				'/post/' + siteSlug
			);
		} );

		it( 'renders correct content and CTAs when first post is published', () => {
			mockIsFirstPostPublished = true;
			renderCelebrationScreen();

			expect( screen.getByText( 'Your blog’s ready!' ) ).toBeInTheDocument();
			expect( screen.getByTitle( 'Preview' ) ).toBeInTheDocument();
			expect(
				screen.getByText( 'Now it’s time to connect your social accounts.' )
			).toBeInTheDocument();

			expect( screen.getByRole( 'link', { name: 'Visit your blog' } ) ).toBeInTheDocument();
			expect( screen.getByRole( 'link', { name: 'Visit your blog' } ) ).toHaveAttribute(
				'href',
				'https://' + siteSlug
			);

			expect( screen.getByRole( 'link', { name: 'Connect to social' } ) ).toBeInTheDocument();
			expect( screen.getByRole( 'link', { name: 'Connect to social' } ) ).toHaveAttribute(
				'href',
				'/marketing/connections/' + siteSlug
			);
		} );
	} );
} );
