import { fetchAllPlugins } from 'calypso/state/plugins/installed/actions';
import prefetchAllSitesPlugins from '../prefetch-all-sites-plugins';
import type { AppState } from 'calypso/types';

jest.mock( 'calypso/state/plugins/installed/actions', () => ( {
	fetchAllPlugins: jest.fn( () => ( { type: 'FETCH_ALL_PLUGINS' } ) ),
} ) );

const SITE_ID = 12345;

const makeState = ( { isRequestingAll = false, plugins = {} } = {} ) => ( {
	plugins: {
		installed: {
			isRequestingAll,
			isRequesting: {},
			plugins,
			status: {},
		},
	},
	sites: {
		items: {
			[ SITE_ID ]: {
				ID: SITE_ID,
				jetpack: true,
				visible: true,
				options: { jetpack_connection_active_plugins: [ 'jetpack' ] },
			},
		},
	},
	currentUser: {
		capabilities: { [ SITE_ID ]: { manage_options: true } },
	},
	ui: { selectedSiteId: null },
} );

const run = ( state: object ) => {
	const dispatch = jest.fn();
	prefetchAllSitesPlugins()( dispatch, () => state as AppState );
	return dispatch;
};

describe( 'prefetchAllSitesPlugins()', () => {
	beforeEach( () => {
		jest.clearAllMocks();
	} );

	test( 'should fetch when no plugins have been loaded yet', () => {
		const dispatch = run( makeState() );

		expect( fetchAllPlugins ).toHaveBeenCalled();
		expect( dispatch ).toHaveBeenCalledWith( { type: 'FETCH_ALL_PLUGINS' } );
	} );

	test( 'should not fetch while a request is already in flight', () => {
		const dispatch = run( makeState( { isRequestingAll: true } ) );

		expect( fetchAllPlugins ).not.toHaveBeenCalled();
		expect( dispatch ).not.toHaveBeenCalled();
	} );

	test( 'should not fetch again once plugins are in state', () => {
		const dispatch = run( {
			...makeState( {
				plugins: {
					[ SITE_ID ]: [
						{ id: 'akismet/akismet', slug: 'akismet', name: 'Akismet', active: true },
					],
				},
			} ),
		} );

		expect( fetchAllPlugins ).not.toHaveBeenCalled();
		expect( dispatch ).not.toHaveBeenCalled();
	} );
} );
