/** @format */

/**
 * External dependencies
 */

import { has, noop } from 'lodash';

/**
 * Internal dependencies
 */
import { EDITOR_TYPE_FETCH, EDITOR_TYPE_RECEIVE, EDITOR_TYPE_UPDATE } from 'state/action-types';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { http } from 'state/data-layer/wpcom-http/actions';
import { registerHandlers } from 'state/data-layer/handler-registry';
import { replaceHistory } from 'state/ui/actions';

const fetchSelectedEditor = action =>
	http(
		{
			method: 'GET',
			path: `/sites/${ action.siteId }/gutenberg`,
			apiNamespace: 'wpcom/v3',
		},
		action
	);

const setSelectedEditor = ( { siteId }, { editor_web: editor } ) => dispatch => {
	dispatch( { type: EDITOR_TYPE_RECEIVE, siteId, editor } );
};

const dispatchFetchSelectedEditor = dispatchRequest( {
	fetch: fetchSelectedEditor,
	onSuccess: setSelectedEditor,
	onError: noop,
} );

const updateSelectedEditor = action =>
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

const setSelectedEditorAndRedirect = (
	{ siteId, redirectUrl },
	{ editor_web: editor }
) => dispatch => {
	dispatch( { type: EDITOR_TYPE_RECEIVE, siteId, editor } );

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
	[ EDITOR_TYPE_FETCH ]: [ dispatchFetchSelectedEditor ],
	[ EDITOR_TYPE_UPDATE ]: [ dispatchUpdateSelectedEditor ],
} );
