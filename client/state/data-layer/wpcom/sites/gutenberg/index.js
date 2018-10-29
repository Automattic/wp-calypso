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
import { registerHandlers } from 'state/data-layer/handler-registry';

export const setType = action =>
	http(
		{
			path: `/sites/${ action.siteId }/gutenberg`,
			method: 'POST',
			apiNamespace: 'wpcom/v2',
			query: {
				editor: action.editor,
			},
			body: {},
		},
		noop
	);

const dispatchEditorTypeRequest = dispatchRequestEx( {
	fetch: setType,
	onSuccess: noop,
	onError: noop,
} );

registerHandlers( 'state/data-layer/wpcom/sites/gutenberg/index.js', {
	[ EDITOR_TYPE_SET ]: [ dispatchEditorTypeRequest ],
} );
