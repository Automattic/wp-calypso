/** @format */

/**
 * External dependencies
 */

import { noop } from 'lodash';

/**
 * Internal dependencies
 */
import { EDITOR_TYPE_REQUEST, EDITOR_TYPE_SET } from 'state/action-types';
import { dispatchRequestEx } from 'state/data-layer/wpcom-http/utils';
import { http } from 'state/data-layer/wpcom-http/actions';
import { registerHandlers } from 'state/data-layer/handler-registry';
import { bypassDataLayer } from 'state/data-layer/utils';

export const fetchSelectedEditor = action =>
	http(
		{
			method: 'GET',
			path: `/sites/${ action.siteId }/gutenberg`,
			apiNamespace: 'wpcom/v2',
		},
		action
	);

export const setSelectedEditor = ( { siteId }, { editor_web: editor } ) => dispatch => {
	dispatch( bypassDataLayer( { type: EDITOR_TYPE_SET, siteId, editor } ) );
};

const dispatchSelectedEditorRequest = dispatchRequestEx( {
	fetch: fetchSelectedEditor,
	onSuccess: setSelectedEditor,
	onError: noop,
} );

export const setType = action => {
	return http(
		{
			path: `/sites/${ action.siteId }/gutenberg`,
			method: 'POST',
			apiNamespace: 'wpcom/v2',
			query: {
				editor: action.editor,
				platform: 'web',
			},
			body: {},
		},
		action
	);
};

const redirectToEditor = action => {
	if ( action.redirectUrl ) {
		//TODO: redirect using window, or if navigating to /gutenberg, dispatch HISTORY_REPLACE
	}
};

const dispatchEditorTypeSetRequest = dispatchRequestEx( {
	fetch: setType,
	onSuccess: redirectToEditor,
	onError: noop,
} );

registerHandlers( 'state/data-layer/wpcom/sites/gutenberg/index.js', {
	[ EDITOR_TYPE_REQUEST ]: [ dispatchSelectedEditorRequest ],
	[ EDITOR_TYPE_SET ]: [ dispatchEditorTypeSetRequest ],
} );
