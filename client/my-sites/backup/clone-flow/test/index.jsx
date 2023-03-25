/**
 * @jest-environment jsdom
 */
import { render } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import getRewindState from 'calypso/state/selectors/get-rewind-state';
import Loading from '../../rewind-flow/loading';
import BackupCloneFlow from '../index';

//jest.mock( '../../rewind-flow/loading' );
jest.mock( 'calypso/state/selectors/get-rewind-state' );

jest.mock( 'calypso/state/selectors/get-site-gmt-offset', () =>
	jest.fn().mockImplementation( () => null )
);

jest.mock( 'calypso/state/selectors/get-site-timezone-value', () =>
	jest.fn().mockImplementation( () => null )
);

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
	} );
} );
