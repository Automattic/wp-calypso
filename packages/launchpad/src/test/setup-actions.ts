/**
 * @jest-environment jsdom
 */
import { setUpActionsForTasks } from '../setup-actions';
import type { LaunchpadTaskActionsProps } from '../types';

jest.mock( '@automattic/viewport', () => ( { isMobile: jest.fn( () => false ) } ) );
jest.mock( '@automattic/data-stores', () => ( { updateLaunchpadSettings: jest.fn() } ) );

const runDriveTraffic = ( calypso_path: string ) => {
	const props: LaunchpadTaskActionsProps = {
		siteSlug: 'example.wordpress.com',
		tasks: [ { id: 'drive_traffic', completed: false, disabled: false, calypso_path } ],
		tracksData: {
			checklistSlug: 'test',
			launchpadContext: 'test',
			recordTracksEvent: jest.fn(),
			tasklistCompleted: false,
		},
		extraActions: {},
		uiContext: 'calypso',
	};
	return setUpActionsForTasks( props )[ 0 ].calypso_path;
};

describe( 'setUpActionsForTasks: drive_traffic tour query arg', () => {
	it( 'appends the tour arg to a relative path', () => {
		expect( runDriveTraffic( '/marketing/connections/example.wordpress.com' ) ).toBe(
			'/marketing/connections/example.wordpress.com?tour=marketingConnectionsTour'
		);
	} );

	it( 'preserves the origin and existing query of an absolute URL', () => {
		expect( runDriveTraffic( 'https://example.com/wp-admin/admin.php?page=jetpack-social' ) ).toBe(
			'https://example.com/wp-admin/admin.php?page=jetpack-social&tour=marketingConnectionsTour'
		);
	} );

	it( 'keeps the fragment after the query', () => {
		expect( runDriveTraffic( '/marketing/connections/example.wordpress.com#section' ) ).toBe(
			'/marketing/connections/example.wordpress.com?tour=marketingConnectionsTour#section'
		);
	} );
} );
