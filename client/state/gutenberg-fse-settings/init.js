import {
	GUTENBERG_FSE_SETTINGS_REQUEST,
	GUTENBERG_FSE_SETTINGS_SET,
} from 'calypso/state/action-types';
import { registerHandlers } from 'calypso/state/data-layer/handler-registry';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'calypso/state/data-layer/wpcom-http/utils';
import { registerReducer } from 'calypso/state/redux-store';
import reducer from './reducer';

registerReducer( [ 'gutenbergFSESettings' ], reducer );

const noop = () => {};

const fetchGutenbergFSESettings = ( action ) =>
	http(
		{
			method: 'GET',
			path: `/sites/${ action.siteId }/gutenberg`,
			apiNamespace: 'wpcom/v4',
		},
		action
	);

const setGutenbergFSESettings = (
	{ siteId },
	{ is_core_fse_eligible: isCoreFSEEligible, is_core_fse_active: isCoreFSEActive }
) => ( dispatch ) => {
	dispatch( { type: GUTENBERG_FSE_SETTINGS_SET, siteId, isCoreFSEActive, isCoreFSEEligible } );
};

const dispatchFetchGutenbergFSESettings = dispatchRequest( {
	fetch: fetchGutenbergFSESettings,
	onSuccess: setGutenbergFSESettings,
	onError: noop,
} );

registerHandlers( 'state/gutenberg-fse-settings/init.js', {
	[ GUTENBERG_FSE_SETTINGS_REQUEST ]: [ dispatchFetchGutenbergFSESettings ],
} );
