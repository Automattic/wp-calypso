/** @format */

/**
 * External dependencies
 */

import { noop } from 'lodash';

/**
 * Internal dependencies
 */
import { EDITOR_TYPE_SET } from 'state/action-types';
import { dispatchRequestEx } from 'state/data-layer/wpcom-http/utils';
import { http } from 'state/data-layer/wpcom-http/actions';
import { setSiteEditor } from 'state/sites/editor/actions';
import { bypassDataLayer } from 'state/data-layer/utils';
import { registerHandlers } from 'state/data-layer/handler-registry';

export const setType = action =>
	http(
		{
			path: `/sites/${ action.siteId }/gutenberg`,
			method: 'POST',
			apiNamespace: 'wpcom/v2',
			query: {
				editor: action.editor,
				http_envelope: 1,
			},
			body: {},
		},
		action
	);

export const receiveEditorTypeError = action => {
	const editor = 'classic' === action.editor ? 'gutenberg' : 'classic';
	return bypassDataLayer( setSiteEditor( action.siteId, editor ) );
};

const dispatchEditorTypeRequest = dispatchRequestEx( {
	fetch: setType,
	onSuccess: noop,
	onError: receiveEditorTypeError,
} );

registerHandlers( 'state/data-layer/wpcom/gutenberg/index.js', {
	[ EDITOR_TYPE_SET ]: [ dispatchEditorTypeRequest ],
} );
