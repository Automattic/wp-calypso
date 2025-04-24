/**
 * @jest-environment jsdom
 */
// @ts-nocheck - TODO: Fix TypeScript issues
import { START_WRITING_FLOW } from '@automattic/onboarding';
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
	stepName: 'celebration-step',
	/* eslint-disable @typescript-eslint/no-empty-function */
	submit: () => {},
	goNext: () => {},
	goToStep: () => {},
	/* eslint-enable @typescript-eslint/no-empty-function */
};

jest.mock( 'calypso/landing/stepper/hooks/use-site', () => ( {
	useSite: () => mockSite,
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

function renderCelebrationScreen( flow ) {
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
				<CelebrationStep { ...stepContentProps } flow={ flow } navigation={ navigation } />
			</QueryClientProvider>
		</Provider>
	);
}

describe( 'The celebration step', () => {
	describe( `The ${ START_WRITING_FLOW } flow`, () => {
		const flow = START_WRITING_FLOW;

		it( 'renders correct content and CTAs', () => {
			renderCelebrationScreen( flow );

			expect( screen.getByText( 'Your blog’s ready!' ) ).toBeInTheDocument();
			expect( screen.getByTitle( 'Preview' ) ).toBeInTheDocument();
			expect(
				screen.getByText( 'Now it’s time to connect your social accounts.' )
			).toBeInTheDocument();

			expect( screen.getByRole( 'button', { name: 'Visit your blog' } ) ).toBeInTheDocument();
			expect( screen.getByRole( 'button', { name: 'Connect to social' } ) ).toBeInTheDocument();
		} );
	} );
} );
