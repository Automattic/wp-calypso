import { getPluginStatusesByType } from 'calypso/state/plugins/installed/selectors';
import { getPluginActionStatuses } from '../get-plugin-action-statuses';

jest.mock( 'calypso/state/plugins/installed/selectors', () => ( {
	...jest.requireActual( 'calypso/state/plugins/installed/selectors' ),
	getPluginStatusesByType: jest.fn(),
} ) );

const FAKE_RESULT = { siteId: '', pluginId: '' };

describe( 'getPluginActionStatuses', () => {
	beforeEach( () => {
		jest.resetAllMocks();
	} );

	it.each( [ [ 'inProgress' ], [ 'completed' ], [ 'error' ], [ 'up-to-date' ] ] )(
		'returns all "%s" statuses',
		( status ) => {
			getPluginStatusesByType.mockImplementation( ( state, type ) =>
				type === status ? [ FAKE_RESULT ] : []
			);

			const results = getPluginActionStatuses( {} );
			expect( results.length ).toBe( 1 );
			expect( results[ 0 ] ).toBe( FAKE_RESULT );
		}
	);

	it.each( [ [ 'mystatus' ], [ 'elderberries' ], [ 'hamster' ] ] )(
		'does not return other status types',
		( status ) => {
			getPluginStatusesByType.mockImplementation( ( state, type ) =>
				type === status ? [ FAKE_RESULT ] : []
			);

			const results = getPluginActionStatuses( {} );
			expect( results.length ).toBe( 0 );
		}
	);
} );
