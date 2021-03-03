/**
 * External dependencies
 */
import { has, noop } from 'lodash';

/**
 * Internal dependencies
 */
import {
	EDITOR_TYPE_REQUEST,
	EDITOR_TYPE_SET,
	EDITOR_TYPE_UPDATE,
	GUTENBERG_IFRAME_ELIGIBLE_SET,
} from 'calypso/state/action-types';
import { dispatchRequest } from 'calypso/state/data-layer/wpcom-http/utils';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { registerHandlers } from 'calypso/state/data-layer/handler-registry';
import { replaceHistory } from 'calypso/state/ui/actions';

import 'calypso/state/gutenberg-iframe-eligible/init';

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

const updateSelectedEditor = ( action ) =>
	http(
		{
			path: `/sites/${ action.siteId }/gutenberg`,
			method: 'POST',
			apiNamespace: 'wpcom/v3',
			query: {
				editor: action.editor,
				platform: 'web',
			},
			body: {},
		},
		action
	);

const setSelectedEditorAndRedirect = ( { siteId, redirectUrl }, { editor_web: editor } ) => (
	dispatch
) => {
	dispatch( { type: EDITOR_TYPE_SET, siteId, editor } );

	if ( ! redirectUrl ) {
		return;
	}
	if ( has( window, 'location.replace' ) && -1 !== redirectUrl.indexOf( 'calypsoify=1' ) ) {
		return window.location.replace( redirectUrl );
	}

	dispatch( replaceHistory( redirectUrl ) );
};

const dispatchUpdateSelectedEditor = dispatchRequest( {
	fetch: updateSelectedEditor,
	onSuccess: setSelectedEditorAndRedirect,
	onError: noop,
} );

registerHandlers( 'state/data-layer/wpcom/sites/gutenberg/index.js', {
	[ EDITOR_TYPE_REQUEST ]: [ dispatchFetchGutenbergOptInData ],
	[ EDITOR_TYPE_UPDATE ]: [ dispatchUpdateSelectedEditor ],
} );
