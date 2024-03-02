/**
 * @jest-environment jsdom
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { useSourceMigrationStatusQuery } from 'calypso/data/site-migration/use-source-migration-status-query';
import MigrationHandler from 'calypso/landing/stepper/declarative-flow/internals/steps-repository/migration-handler';
import { createReduxStore } from 'calypso/state';
import { getInitialState, getStateFromCache } from 'calypso/state/initial-state';
import initialReducer from 'calypso/state/reducer';
import { setStore } from 'calypso/state/redux-store';

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

jest.mock( 'react-router-dom', () => ( {
	...( jest.requireActual( 'react-router-dom' ) as object ),
	useLocation: jest.fn().mockImplementation( () => ( {
		pathname: '/setup/import-focused/migrationHandler',
		search: `?from=self-hosted.site`,
		hash: '',
		state: undefined,
	} ) ),
} ) );

jest.mock( 'calypso/data/site-migration/use-source-migration-status-query' );
jest.mock( 'calypso/data/sites/use-site-excerpts-query', () => ( {
	useSiteExcerptsQuery: () => ( {
		data: [],
	} ),
} ) );

function renderMigrationHandlerStep() {
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

	return render(
		<Provider store={ reduxStore }>
			<QueryClientProvider client={ queryClient }>
				<MigrationHandler
					flow="import-focused"
					stepName="migration-handler"
					navigation={ navigation }
				/>
			</QueryClientProvider>
		</Provider>
	);
}

describe( 'MigrationHandlerStep', () => {
	beforeEach( () => {
		jest.clearAllMocks();
	} );

	test( 'should not run navigation submit', async () => {
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		useSourceMigrationStatusQuery.mockImplementation( () => ( {
			data: {
				status: 'inactive',
				target_blog_id: 1234,
				is_target_blog_admin: true,
				is_target_blog_upgraded: true,
				target_blog_slug: 'test_blog_slug',
			},
			isError: true,
		} ) );
		renderMigrationHandlerStep();
		expect( jest.spyOn( navigation, 'submit' ) ).not.toHaveBeenCalled();
	} );

	test( 'should run navigation submit', async () => {
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		useSourceMigrationStatusQuery.mockImplementationOnce( () => ( {
			data: {
				status: 'inactive',
				target_blog_id: 1234,
				is_target_blog_admin: true,
				is_target_blog_upgraded: true,
				target_blog_slug: 'test_blog_slug',
			},
			isError: false,
		} ) );

		renderMigrationHandlerStep();

		expect( screen.getByText( 'Scanning your site' ) ).toBeInTheDocument();
		expect( jest.spyOn( navigation, 'submit' ) ).toHaveBeenCalled();
	} );

	test( 'should show non authorized screen', async () => {
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		useSourceMigrationStatusQuery.mockImplementationOnce( () => {
			return { data: {}, isError: true };
		} );

		renderMigrationHandlerStep();

		await waitFor( () => {
			expect( jest.spyOn( navigation, 'submit' ) ).not.toHaveBeenCalled();
			expect( screen.getByText( "We couldn't start the migration" ) ).toBeInTheDocument();
		} );
	} );
} );
