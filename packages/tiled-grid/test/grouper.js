/** @format */

/**
 * External dependencies
 */
import { cloneDeep } from 'lodash';

/**
 * Internal dependencies
 */
import { attachments } from './fixtures/attachments';
import { Jetpack_Tiled_Gallery_Grouper } from '../grouper';

describe( 'grouper', () => {
	test( 'groups as expected', () => {
		const grouper = new Jetpack_Tiled_Gallery_Grouper( cloneDeep( attachments ) );
		expect( grouper.grouped_images ).toMatchSnapshot();
	} );
} );
