/** @format */

/**
 * External dependencies
 */

import { has, noop } from 'lodash';

/**
 * Internal dependencies
 */
import { EDITOR_TYPE_REQUEST, EDITOR_TYPE_SET } from 'state/action-types';
import { dispatchRequestEx } from 'state/data-layer/wpcom-http/utils';
import { http } from 'state/data-layer/wpcom-http/actions';
import { registerHandlers } from 'state/data-layer/handler-registry';
import { bypassDataLayer } from 'state/data-layer/utils';
import { replaceHistory } from 'state/ui/actions';

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

const redirectToEditor = ( { redirectUrl } ) => dispatch => {
	if ( ! redirectUrl ) {
		return;
	}
	if ( has( window, 'location.replace' ) && -1 !== redirectUrl.indexOf( 'calypsoify=1' ) ) {
		return window.location.replace( redirectUrl );
	}
	dispatch( replaceHistory( redirectUrl ) );
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
