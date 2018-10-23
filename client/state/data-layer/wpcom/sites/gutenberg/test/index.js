/** @format */

/**
 * Internal dependencies
 */
import { setType } from '../';
import { http } from 'state/data-layer/wpcom-http/actions';
import { setSelectedEditor } from 'state/selected-editor/actions';

describe( 'setType()', () => {
	test( 'should dispatch a http request', () => {
		const action = setSelectedEditor( 123, 'gutenberg' );
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
