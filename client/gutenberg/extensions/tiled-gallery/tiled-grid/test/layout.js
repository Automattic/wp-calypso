/**
 * External dependencies
 */
import { cloneDeep } from 'lodash';

/**
 * Internal dependencies
 */
import { attachments } from './fixtures/attachments';
import { TiledGalleryLayout } from '../layout';

describe( 'layout', () => {
	test( 'creates layout as expected', () => {
		const layout = new TiledGalleryLayout( {
			attachments: cloneDeep( attachments ),
			contentWidth: 640,
			margin: 4,
		} );
		expect( layout.columns ).toMatchSnapshot();
	} );
} );
