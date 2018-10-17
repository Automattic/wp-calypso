/** @format */

/**
 * Internal dependencies
 */
import { setType, receiveEditorTypeError } from '../';
import { http } from 'state/data-layer/wpcom-http/actions';
import { setSiteEditor } from 'state/sites/actions';
import { EDITOR_TYPE_SET } from 'state/action-types';

describe( 'setType()', () => {
	test( 'should dispatch a http request', () => {
		const action = setSiteEditor( 123, 'gutenberg' );
		const output = setType( action );
		expect( output ).toEqual(
			http(
				{
					path: `/sites/123/gutenberg`,
					method: 'POST',
					apiNamespace: 'wpcom/v2',
					query: {
						editor: 'gutenberg',
						http_envelope: 1,
					},
					body: {},
				},
				action
			)
		);
	} );
} );

describe( 'receiveEditorTypeError()', () => {
	test( 'should return an action to undo the optimistic update, bypassing the data layer', () => {
		const output = receiveEditorTypeError( {
			type: EDITOR_TYPE_SET,
			siteId: 123,
			editor: 'gutenberg',
		} );
		expect( output ).toEqual( {
			type: EDITOR_TYPE_SET,
			siteId: 123,
			editor: 'classic',
			meta: {
				dataLayer: {
					doBypass: true,
				},
			},
		} );
	} );
} );
