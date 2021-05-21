/**
 * Internal dependencies
 */
import {
	EDITOR_TYPE_REQUEST,
	EDITOR_TYPE_SET,
	GUTENBERG_IFRAME_ELIGIBLE_SET,
} from 'calypso/state/action-types';
import { dispatchRequest } from 'calypso/state/data-layer/wpcom-http/utils';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { registerHandlers } from 'calypso/state/data-layer/handler-registry';

import 'calypso/state/gutenberg-iframe-eligible/init';

const noop = () => {};

const fetchGutenbergOptInData = ( action ) =>
	http(
		{
			method: 'GET',
			path: `/sites/${ action.siteId }/gutenberg`,
			apiNamespace: 'wpcom/v3',
		},
		action
	);

const setGutenbergOptInData = (
	{ siteId },
	{ editor_web: editor, eligible_gutenframe: isEligibleForGutenframe }
) => ( dispatch ) => {
	dispatch( { type: EDITOR_TYPE_SET, siteId, editor } );
	dispatch( { type: GUTENBERG_IFRAME_ELIGIBLE_SET, siteId, isEligibleForGutenframe } );
};

const dispatchFetchGutenbergOptInData = dispatchRequest( {
	fetch: fetchGutenbergOptInData,
	onSuccess: setGutenbergOptInData,
	onError: noop,
} );

registerHandlers( 'state/data-layer/wpcom/sites/gutenberg/index.js', {
	[ EDITOR_TYPE_REQUEST ]: [ dispatchFetchGutenbergOptInData ],
} );
