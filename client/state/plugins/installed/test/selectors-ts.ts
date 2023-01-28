import deepFreeze from 'deep-freeze';
import {
	DEACTIVATE_PLUGIN,
	ENABLE_AUTOUPDATE_PLUGIN,
	INSTALL_PLUGIN,
} from 'calypso/lib/plugins/constants';
import { userState } from 'calypso/state/selectors/test/fixtures/user-state';
import { getAllPluginsIndexedByPluginSlug } from '../selectors-ts';
import { akismet, helloDolly, jetpack, jetpackWithSites } from './fixtures/plugins';

const siteOneId = 12345;
const siteTwoId = 54321;
const siteThreeId = 21435;

// const nonExistingSiteId1 = 0;
// const nonExistingSiteId2 = 1;

const createError = function ( error, message, name = false ) {
	const errorObj = new Error( message );
	errorObj.name = name || error;
	return errorObj;
};

const state = deepFreeze( {
	plugins: {
		installed: {
			isRequesting: {
				[ siteOneId ]: false,
				[ siteTwoId ]: false,
				[ siteThreeId ]: true,
			},
			plugins: {
				[ siteOneId ]: [ akismet, helloDolly ],
				[ siteTwoId ]: [ jetpack, helloDolly ],
			},
			status: {
				[ siteOneId ]: {
					'akismet/akismet': {
						status: 'inProgress',
						action: ENABLE_AUTOUPDATE_PLUGIN,
					},
					'jetpack/jetpack': {
						status: 'completed',
						action: DEACTIVATE_PLUGIN,
					},
				},
				[ siteTwoId ]: {
					'akismet/akismet': {
						status: 'error',
						action: INSTALL_PLUGIN,
						error: createError( 'no_package', 'Download failed.' ),
					},
				},
			},
		},
	},
	sites: {
		items: {
			[ siteOneId ]: {
				ID: siteOneId,
				jetpack: true,
				visible: true,
				name: 'One Site',
			},
			[ siteTwoId ]: {
				ID: siteTwoId,
				jetpack: true,
				visible: true,
				name: 'Two Site',
			},
		},
	},
	...userState,
} );

describe( 'getAllPluginsIndexedByPluginSlug', () => {
	test( 'Returns the jetpack plugin', () => {
		const plugins = getAllPluginsIndexedByPluginSlug( state );

		expect( plugins[ 'jetpack' ] ).toEqual( jetpackWithSites );
	} );
} );
