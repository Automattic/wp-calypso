/** @format */

/**
 * External dependencies
 */

/**
 * Internal dependencies
 */
import { EDITOR_TYPE_UPDATE } from 'state/action-types';
import 'state/data-layer/wpcom/sites/gutenberg';
import { empty, requestHttpData } from 'state/data-layer/http-data';
import { http } from '../data-layer/wpcom-http/actions';

/*export const requestSelectedEditor = siteId => ( {
	type: EDITOR_TYPE_REQUEST,
	siteId,
} );*/

export const requestSelectedEditor = siteId => {
	if ( ! siteId ) {
		return empty;
	}

	const id = `selected-editor-${ siteId }`;

	return requestHttpData(
		id,
		http( {
			method: 'GET',
			path: `/sites/${ siteId }/gutenberg`,
			apiNamespace: 'wpcom/v3',
		} ),
		{
			fromApi: () => ( { editor_web } ) => {
				switch ( editor_web ) {
					case 'classic':
					case 'gutenberg-iframe':
					case 'gutenberg-redirect':
					case 'gutenberg-redirect-and-style':
						return [ [ id, editor_web ] ];

					default:
						throw new Error( `unknown editor for site: ${ editor_web }` );
				}
			},
		}
	);
};

export const setSelectedEditor = ( siteId, editor, redirectUrl ) => ( {
	type: EDITOR_TYPE_UPDATE,
	siteId,
	editor,
	redirectUrl,
} );
