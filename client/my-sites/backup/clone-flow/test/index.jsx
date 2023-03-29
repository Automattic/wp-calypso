/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import { useState } from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import ActivityCardList from 'calypso/components/activity-card-list';
import AdvancedCredentials from 'calypso/components/advanced-credentials';
import BackupSuccessful from 'calypso/components/jetpack/daily-backup-status/status-card/backup-successful';
import StepProgress from 'calypso/components/step-progress';
import useRewindableActivityLogQuery from 'calypso/data/activity-log/use-rewindable-activity-log-query';
import getInProgressRewindStatus from 'calypso/state/selectors/get-in-progress-rewind-status';
import getRewindState from 'calypso/state/selectors/get-rewind-state';
import Error from '../../rewind-flow/error';
import Loading from '../../rewind-flow/loading';
import ProgressBar from '../../rewind-flow/progress-bar';
import RewindConfigEditor from '../../rewind-flow/rewind-config-editor';
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

jest.mock( 'calypso/data/activity-log/use-rewindable-activity-log-query' );
jest.mock( 'calypso/state/selectors/get-in-progress-rewind-status' );
jest.mock( 'calypso/state/selectors/get-rewind-state' );

jest.mock( 'calypso/state/selectors/get-site-gmt-offset', () =>
	jest.fn().mockImplementation( () => null )
);

jest.mock( 'calypso/state/selectors/get-site-timezone-value', () =>
	jest.fn().mockImplementation( () => null )
);

jest.mock( 'calypso/components/activity-card-list', () =>
	jest.fn().mockImplementation( () => null )
);

jest.mock( 'calypso/components/advanced-credentials', () =>
	jest.fn().mockImplementation( () => null )
);
jest.mock( 'calypso/components/jetpack/daily-backup-status/status-card/backup-successful', () =>
	jest.fn().mockImplementation( () => null )
);

jest.mock( 'calypso/components/step-progress', () => jest.fn().mockImplementation( () => null ) );
jest.mock( '../../rewind-flow/error', () => jest.fn().mockImplementation( () => null ) );
jest.mock( '../../rewind-flow/loading', () => jest.fn().mockImplementation( () => null ) );
jest.mock( '../../rewind-flow/progress-bar', () => jest.fn().mockImplementation( () => null ) );
jest.mock( '../../rewind-flow/rewind-config-editor', () =>
	jest.fn().mockImplementation( () => null )
);

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

function getLogs() {
	return {
		data: [
			{
				actorAvatarUrl: 'https://www.gravatar.com/avatar/0',
				actorName: 'Jetpack',
				actorRemoteId: 0,
				actorRole: '',
				actorType: 'Application',
				actorWpcomId: 0,
				activityDate: '2023-03-28T23:28:03.804+00:00',
				activityGroup: 'rewind',
				activityIcon: 'cloud',
				activityId: '111111111111',
				activityIsRewindable: true,
				activityName: 'rewind__backup_only_complete_full',
				activityTitle: 'Backup complete',
				activityTs: 1680046083805,
				activityDescription: [
					{
						children: [
							{
								text: '17 plugins, 7 themes, 1467 uploads, 32 posts, 5 pages, 11 products, 80 orders',
							},
						],
					},
				],
				activityMeta: {},
				rewindId: '1680046083.805',
				activityStatus: 'success',
				activityType: 'Backup',
				activityWarnings: {
					themes: [],
					plugins: [],
					uploads: [],
					roots: [],
					contents: [],
					tables: [],
				},
				activityErrors: [],
			},
			{
				actorAvatarUrl: 'https://www.gravatar.com/avatar/0',
				actorName: 'actorTest',
				actorRemoteId: 6,
				actorRole: 'administrator',
				actorType: 'Person',
				actorWpcomId: 111222333,
				activityDate: '2023-03-28T23:08:01.000+00:00',
				activityGroup: 'attachment',
				activityIcon: 'image',
				activityId: '2222222222222',
				activityIsRewindable: true,
				activityName: 'attachment__uploaded',
				activityTitle: 'Image uploaded',
				activityTs: 1680044881009,
				activityDescription: [
					{
						type: 'link',
						url: 'https://wordpress.com/media/11111111/333',
						intent: 'edit',
						section: 'media',
						children: [ 'wp-1111111111111.jpg' ],
					},
				],
				activityMedia: {
					available: true,
					type: 'Image',
					name: 'wp-2222222222.jpg',
					url: 'https://i0.wp.com/1.jpg',
					thumbnail_url: 'https://i0.wp.com/2.jpg?',
					medium_url: 'https://i0.wp.com/3.jpg',
				},
				activityMeta: {},
				rewindId: '1680044877.1830',
				activityStatus: 'success',
			},
		],
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
	describe( 'Render components in flow', () => {
		beforeEach( () => {
			jest.clearAllMocks();

			getInProgressRewindStatus.mockImplementation( () => undefined );
		} );

		test( 'Render RewindFlowLoading if state is not initialized', () => {
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

		test( 'Render AdvancedCredentials if user has not set the destination', () => {
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

		test( 'Render ActivityCardList if user has not set the period to clone', () => {
			getRewindState.mockImplementation( () => ( {
				state: 'active',
			} ) );
			useRewindableActivityLogQuery.mockImplementation( () => getLogs() );

			const mockStore = configureStore();
			const store = mockStore( createState() );
			const queryClient = new QueryClient();

			// Initialize mock UseState on BackupCloneFlow and set userHasSetDestination: false
			initializeUseStateMockCloneFlow( {
				userHasSetDestination: true,
				userHasSetBackupPeriod: false,
			} );

			// Render component
			render(
				<Provider store={ store }>
					<QueryClientProvider client={ queryClient }>
						<BackupCloneFlow />
					</QueryClientProvider>
				</Provider>
			);

			expect( StepProgress ).toHaveBeenCalledTimes( 1 );
			expect( BackupSuccessful ).toHaveBeenCalledTimes( 1 );
			expect( ActivityCardList ).toHaveBeenCalledTimes( 1 );
		} );

		test( 'Render RewindConfigEditor if user has not requested the clone yet', () => {
			getRewindState.mockImplementation( () => ( {
				state: 'active',
			} ) );

			const mockStore = configureStore();
			const store = mockStore( createState() );
			const queryClient = new QueryClient();

			// Initialize mock UseState on BackupCloneFlow and set userHasSetDestination: false
			initializeUseStateMockCloneFlow( {
				userHasSetDestination: true,
				userHasSetBackupPeriod: true,
				userHasRequestedRestore: false,
			} );

			// Render component
			render(
				<Provider store={ store }>
					<QueryClientProvider client={ queryClient }>
						<BackupCloneFlow />
					</QueryClientProvider>
				</Provider>
			);

			expect( StepProgress ).toHaveBeenCalledTimes( 1 );
			expect( RewindConfigEditor ).toHaveBeenCalledTimes( 1 );
		} );

		test( 'Render ProgressBar if uses requested the clone', () => {
			getRewindState.mockImplementation( () => ( {
				state: 'active',
			} ) );

			const mockStore = configureStore();
			const store = mockStore( createState() );
			const queryClient = new QueryClient();

			// Initialize mock UseState on BackupCloneFlow and set userHasSetDestination: false
			initializeUseStateMockCloneFlow( {
				userHasSetDestination: true,
				userHasSetBackupPeriod: true,
				userHasRequestedRestore: true,
			} );
			getInProgressRewindStatus.mockImplementation( () => undefined );

			// Render component
			render(
				<Provider store={ store }>
					<QueryClientProvider client={ queryClient }>
						<BackupCloneFlow />
					</QueryClientProvider>
				</Provider>
			);

			expect( ProgressBar ).toHaveBeenCalledTimes( 1 );
		} );

		test( 'Render ProgressBar if inProgressRewindStatus is queued', () => {
			getRewindState.mockImplementation( () => ( {
				state: 'active',
			} ) );

			const mockStore = configureStore();
			const store = mockStore( createState() );
			const queryClient = new QueryClient();

			// Initialize mock UseState on BackupCloneFlow and set userHasSetDestination: false
			initializeUseStateMockCloneFlow( {
				userHasSetDestination: true,
				userHasSetBackupPeriod: true,
				userHasRequestedRestore: true,
			} );
			getInProgressRewindStatus.mockImplementation( () => 'queued' );

			// Render component
			render(
				<Provider store={ store }>
					<QueryClientProvider client={ queryClient }>
						<BackupCloneFlow />
					</QueryClientProvider>
				</Provider>
			);

			expect( ProgressBar ).toHaveBeenCalledTimes( 1 );
		} );

		test( 'Render ProgressBar if inProgressRewindStatus is running', () => {
			getRewindState.mockImplementation( () => ( {
				state: 'active',
			} ) );

			const mockStore = configureStore();
			const store = mockStore( createState() );
			const queryClient = new QueryClient();

			// Initialize mock UseState on BackupCloneFlow and set userHasSetDestination: false
			initializeUseStateMockCloneFlow( {
				userHasSetDestination: true,
				userHasSetBackupPeriod: true,
				userHasRequestedRestore: true,
			} );
			getInProgressRewindStatus.mockImplementation( () => 'running' );

			// Render component
			render(
				<Provider store={ store }>
					<QueryClientProvider client={ queryClient }>
						<BackupCloneFlow />
					</QueryClientProvider>
				</Provider>
			);

			expect( ProgressBar ).toHaveBeenCalledTimes( 1 );
		} );

		test( 'Render finished text if the clone is finished', () => {
			getRewindState.mockImplementation( () => ( {
				state: 'active',
			} ) );

			const mockStore = configureStore();
			const store = mockStore( createState() );
			const queryClient = new QueryClient();

			// Initialize mock UseState on BackupCloneFlow and set userHasSetDestination: false
			initializeUseStateMockCloneFlow( {
				userHasSetDestination: true,
				userHasSetBackupPeriod: true,
				userHasRequestedRestore: true,
			} );
			getInProgressRewindStatus.mockImplementation( () => 'finished' );

			// Render component
			render(
				<Provider store={ store }>
					<QueryClientProvider client={ queryClient }>
						<BackupCloneFlow />
					</QueryClientProvider>
				</Provider>
			);

			expect( screen.queryByText( /Your site has been successfully copied./i ) ).toBeVisible();
		} );

		test( 'Render error if it is in the wrong status', () => {
			getRewindState.mockImplementation( () => ( {
				state: 'active',
			} ) );

			const mockStore = configureStore();
			const store = mockStore( createState() );
			const queryClient = new QueryClient();

			// Initialize mock UseState on BackupCloneFlow and set userHasSetDestination: false
			initializeUseStateMockCloneFlow( {
				userHasSetDestination: true,
				userHasSetBackupPeriod: true,
				userHasRequestedRestore: true,
			} );
			getInProgressRewindStatus.mockImplementation( () => 'wrong-status' );

			// Render component
			render(
				<Provider store={ store }>
					<QueryClientProvider client={ queryClient }>
						<BackupCloneFlow />
					</QueryClientProvider>
				</Provider>
			);
			expect( Error ).toHaveBeenCalledTimes( 1 );
		} );
	} );
} );
