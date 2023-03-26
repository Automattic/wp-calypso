/**
 * @jest-environment jsdom
 */
import { render } from '@testing-library/react';
import { useState } from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import AdvancedCredentials from 'calypso/components/advanced-credentials';
import StepProgress from 'calypso/components/step-progress';
import getRewindState from 'calypso/state/selectors/get-rewind-state';
import Loading from '../../rewind-flow/loading';
import BackupCloneFlow from '../index';

jest.mock( 'react', () => ( {
	...jest.requireActual( 'react' ),
	useState: jest.fn(),
} ) );

jest.mock( 'i18n-calypso', () => ( {
	...jest.requireActual( 'i18n-calypso' ),
	localize: ( x ) => x,
	translate: ( x ) => x,
	useTranslate: jest.fn( () => ( text ) => text ),
} ) );

jest.mock( 'calypso/data/activity-log/use-rewindable-activity-log-query', () =>
	jest.fn().mockImplementation( () => {
		return { isLoading: true, data: null };
	} )
);

jest.mock( 'calypso/state/selectors/get-rewind-state' );

jest.mock( 'calypso/state/selectors/get-site-gmt-offset', () =>
	jest.fn().mockImplementation( () => null )
);

jest.mock( 'calypso/state/selectors/get-site-timezone-value', () =>
	jest.fn().mockImplementation( () => null )
);

jest.mock( 'calypso/components/advanced-credentials', () =>
	jest.fn().mockImplementation( () => null )
);
jest.mock( 'calypso/components/step-progress', () => jest.fn().mockImplementation( () => null ) );
jest.mock( '../../rewind-flow/loading', () => jest.fn().mockImplementation( () => null ) );

function createState( siteId = 1 ) {
	return {
		currentUser: {
			capabilities: {
				[ siteId ]: {
					publish_posts: true,
				},
			},
		},
		sites: {
			plans: {
				[ siteId ]: {},
			},
		},
		ui: {
			selectedSiteId: siteId,
			section: {
				name: 'backup"',
				paths: [ '/backup' ],
				module: 'calypso/my-sites/backup',
				group: 'sites',
			},
		},
		preferences: {
			remoteValues: {},
		},
		documentHead: { unreadCount: 1 },
	};
}

function initializeUseStateMockCloneFlow( {
	rewindConfig = {
		themes: true,
		plugins: true,
		uploads: true,
		sqls: true,
		roots: true,
		contents: true,
	},
	userHasRequestedRestore = false,
	userHasSetDestination = false,
	cloneDestination = '',
	userHasSetBackupPeriod = false,
	backupPeriod = '',
	backupDisplayDate = '',
} = {} ) {
	useState
		.mockReturnValueOnce( [ rewindConfig, jest.fn() ] )
		.mockReturnValueOnce( [ userHasRequestedRestore, jest.fn() ] )
		.mockReturnValueOnce( [ userHasSetDestination, jest.fn() ] )
		.mockReturnValueOnce( [ cloneDestination, jest.fn() ] )
		.mockReturnValueOnce( [ userHasSetBackupPeriod, jest.fn() ] )
		.mockReturnValueOnce( [ backupPeriod, jest.fn() ] )
		.mockReturnValueOnce( [ backupDisplayDate, jest.fn() ] );
}

describe( 'BackupCloneFlow render', () => {
	describe( 'Render loading it state is uninitialized', () => {
		beforeEach( () => {
			jest.clearAllMocks();
		} );

		test( 'RewindFlowLoading is rendered if state is not initialized', () => {
			getRewindState.mockImplementation( () => ( {
				state: 'uninitialized',
			} ) );

			const mockStore = configureStore();
			const store = mockStore( createState() );
			const queryClient = new QueryClient();

			// Initialize mock UseState on BackupCloneFlow
			initializeUseStateMockCloneFlow();

			// Render component
			render(
				<Provider store={ store }>
					<QueryClientProvider client={ queryClient }>
						<BackupCloneFlow />
					</QueryClientProvider>
				</Provider>
			);

			expect( Loading ).toHaveBeenCalledTimes( 1 );
		} );

		test( 'AdvancedCredentials is rendered if user has not set the destination', () => {
			getRewindState.mockImplementation( () => ( {
				state: 'active',
			} ) );

			const mockStore = configureStore();
			const store = mockStore( createState() );
			const queryClient = new QueryClient();

			// Initialize mock UseState on BackupCloneFlow and set userHasSetDestination: false
			initializeUseStateMockCloneFlow( { userHasSetDestination: false } );

			// Render component
			render(
				<Provider store={ store }>
					<QueryClientProvider client={ queryClient }>
						<BackupCloneFlow />
					</QueryClientProvider>
				</Provider>
			);

			expect( StepProgress ).toHaveBeenCalledTimes( 1 );
			expect( AdvancedCredentials ).toHaveBeenCalledTimes( 1 );
		} );
	} );
} );
