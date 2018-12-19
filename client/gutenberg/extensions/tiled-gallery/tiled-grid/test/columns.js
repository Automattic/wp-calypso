/**
 * External dependencies
 */
import { cloneDeep } from 'lodash';

/**
 * Internal dependencies
 */
import { attachments } from './fixtures/attachments';
import { Jetpack_Tiled_Gallery_Layout } from '../layout';

describe( 'layout', () => {
	test( 'creates columns as expected', () => {
		const layout = new Jetpack_Tiled_Gallery_Layout( {
			attachments: cloneDeep( attachments ),
			contentWidth: 640,
			margin: 4,
		} );
		expect( layout.columns ).toMatchSnapshot();
	} );
} );
