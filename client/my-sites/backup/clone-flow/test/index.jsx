/**
 * @jest-environment jsdom
 */
import { screen, fireEvent } from '@testing-library/react';
import Modal from 'react-modal';
import useRewindableActivityLogQuery from 'calypso/data/activity-log/use-rewindable-activity-log-query';
import documentHead from 'calypso/state/document-head/reducer';
import preferences from 'calypso/state/preferences/reducer';
import getRestoreProgress from 'calypso/state/selectors/get-restore-progress';
import getRewindState from 'calypso/state/selectors/get-rewind-state';
import ui from 'calypso/state/ui/reducer';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import BackupCloneFlow from '../index';

const initialState = {
	currentUser: {
		capabilities: {
			[ 1 ]: {
				publish_posts: true,
			},
		},
	},
	sites: {
		plans: {
			[ 1 ]: {},
		},
	},
	ui: {
		selectedSiteId: 1,
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

const render = ( element ) =>
	renderWithProvider( element, {
		initialState,
		reducers: { ui, documentHead, preferences },
	} );

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
jest.mock( 'calypso/state/rewind/selectors/get-backup-staging-sites', () =>
	jest.fn().mockImplementation( () => [
		{
			blog_id: 'test',
			siteurl: 'example.com',
		},
	] )
);

// Mock several data-fetching related selectors which may not be available.
jest.mock( 'calypso/state/rewind/selectors/has-fetched-staging-sites-list' );
jest.mock( 'calypso/state/rewind/selectors/is-fetching-staging-sites-list' );
jest.mock( 'calypso/data/activity-log/use-rewindable-activity-log-query' );
jest.mock( 'calypso/state/selectors/get-rewind-state' );
jest.mock( 'calypso/state/selectors/get-restore-progress' );
jest.mock( 'calypso/state/selectors/get-site-gmt-offset' );
jest.mock( 'calypso/state/selectors/get-site-timezone-value' );
jest.mock( 'calypso/state/selectors/get-jetpack-credentials-test-status' );
jest.mock( 'calypso/state/selectors/is-requesting-site-credentials' );
jest.mock( 'calypso/state/jetpack/credentials/selectors' );

const mockLogData = {
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

// This tests the user going through each step of the clone flow. Abstracted here
// so that different behavior at the end of the flow can be tested without
// duplicating everything.
function progressThroughFlow() {
	// 1: Search for the example staging site and click it.
	const input = screen.getByPlaceholderText( 'Search for a destination', { exact: false } );
	fireEvent.change( input, { target: { value: 'example.com' } } );
	fireEvent.mouseDown( screen.getByRole( 'button', { name: 'example.com' } ) );

	// 2: Check if backup period selector is shown and select a backup period.
	expect( screen.getByText( 'What do you want to copy to', { exact: false } ) ).toBeInTheDocument();
	fireEvent.click( screen.getByRole( 'button', { name: 'Clone from here' } ) );

	// 3. Verify the editor is shown and click the continue buttons.
	expect(
		screen.getByText( 'Choose the items you wish to restore', { exact: false } )
	).toBeInTheDocument();
	fireEvent.click( screen.getByRole( 'button', { name: 'Confirm configuration' } ) );
	fireEvent.click( screen.getByRole( 'button', { name: 'Yes, continue' } ) );
}

describe( 'BackupCloneFlow render', () => {
	beforeEach( () => {
		jest.clearAllMocks();
	} );

	test( 'Render RewindFlowLoading if state is not initialized', () => {
		getRewindState.mockImplementation( () => ( { state: 'uninitialized' } ) );
		render( <BackupCloneFlow /> );
		expect( screen.getByText( 'Loading restore', { exact: false } ) ).toBeInTheDocument();
	} );

	test( 'Render AdvancedCredentials if user has not set the destination', () => {
		getRewindState.mockImplementation( () => ( { state: 'active' } ) );
		render( <BackupCloneFlow /> );

		// Click the enter credentials button and verify the form opens:
		const addCredentials = screen.getByText( 'Enter credentials', { exact: false } );
		fireEvent.click( addCredentials );
		expect( screen.getByText( 'Remote server credentials' ) ).toBeInTheDocument();
	} );

	test( 'Renders each step of the flow', () => {
		getRewindState.mockImplementation( () => ( { state: 'active' } ) );
		useRewindableActivityLogQuery.mockImplementation( () => mockLogData );

		const { container } = render( <BackupCloneFlow /> );
		Modal.setAppElement( container );

		progressThroughFlow();
		expect(
			screen.getByText( 'Jetpack is copying your site', { exact: false } )
		).toBeInTheDocument();
	} );

	test( 'Render finished text if the clone is finished', () => {
		getRewindState.mockImplementation( () => ( { state: 'active' } ) );
		getRestoreProgress.mockImplementation( () => ( { status: 'finished' } ) );
		render( <BackupCloneFlow /> );

		progressThroughFlow();
		expect( screen.queryByText( /Your site has been successfully copied./i ) ).toBeVisible();
	} );

	test( 'Render error if it is in the wrong status', () => {
		getRewindState.mockImplementation( () => ( { state: 'active' } ) );
		getRestoreProgress.mockImplementation( () => ( { status: 'wrong-status' } ) );
		render( <BackupCloneFlow /> );

		progressThroughFlow();
		expect(
			screen.getByText( 'An error occurred while restoring your site', { exact: false } )
		).toBeInTheDocument();
	} );
} );
