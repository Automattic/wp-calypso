/**
 * @jest-environment jsdom
 */
import config from '@automattic/calypso-config';
import { buildFilters } from '../sites-dashboard-provider';

jest.mock( '@automattic/calypso-config', () => {
	const actual = jest.requireActual( '@automattic/calypso-config' );
	return {
		...actual,
		__esModule: true,
		default: { ...actual.default, isEnabled: jest.fn() },
		isEnabled: jest.fn(),
	};
} );

const mockIsEnabled = config.isEnabled as jest.Mock;

const setCoreUpdatesFilter = ( enabled: boolean ) =>
	mockIsEnabled.mockImplementation( ( flag: string ) =>
		flag === 'jetpack/agency-core-updates-filter' ? enabled : false
	);

describe( 'buildFilters', () => {
	beforeEach( () => {
		mockIsEnabled.mockReset();
	} );

	it( 'maps known issue types to their filter refs', () => {
		setCoreUpdatesFilter( false );

		expect( buildFilters( { issueTypes: 'backup_failed,site_down' } ) ).toEqual( [
			{ field: 'status', operator: 'is', value: 2 },
			{ field: 'status', operator: 'is', value: 6 },
		] );
	} );

	it( 'includes core_updates when the flag is enabled', () => {
		setCoreUpdatesFilter( true );

		expect( buildFilters( { issueTypes: 'core_updates' } ) ).toEqual( [
			{ field: 'status', operator: 'is', value: 8 },
		] );
	} );

	// The endpoint ignores unknown filters and returns every site, so a disabled
	// core_updates filter must be dropped rather than passed through as all_issues.
	it( 'drops core_updates when the flag is disabled', () => {
		setCoreUpdatesFilter( false );

		expect( buildFilters( { issueTypes: 'core_updates' } ) ).toEqual( [] );
	} );

	it( 'keeps sibling filters when core_updates is dropped', () => {
		setCoreUpdatesFilter( false );

		expect( buildFilters( { issueTypes: 'core_updates,threats_found' } ) ).toEqual( [
			{ field: 'status', operator: 'is', value: 4 },
		] );
	} );

	it( 'falls back to all_issues for unrecognised issue types', () => {
		setCoreUpdatesFilter( false );

		expect( buildFilters( { issueTypes: 'not_a_real_filter' } ) ).toEqual( [
			{ field: 'status', operator: 'is', value: 1 },
		] );
	} );
} );
