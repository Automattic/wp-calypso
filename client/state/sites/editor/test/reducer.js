/** @format */

/**
 * External dependencies
 */
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import { items as unwrappedItems } from '../reducer';
import { EDITOR_TYPE_SET } from 'state/action-types';
import { withSchemaValidation } from 'state/utils';

const items = withSchemaValidation( unwrappedItems.schema, unwrappedItems );

describe( 'reducer', () => {
	test( "should add the given site's editor property if not present and a valid value is received", () => {
		const original = deepFreeze( {
			2916284: {
				ID: 2916284,
				name: 'WordPress.com Example Blog',
			},
		} );
		const state = items( original, {
			type: EDITOR_TYPE_SET,
			siteId: 2916284,
			editor: 'gutenberg',
		} );

		expect( state ).to.eql( {
			2916284: {
				ID: 2916284,
				name: 'WordPress.com Example Blog',
				editor: 'gutenberg',
			},
		} );
	} );

	test( "should update the given site's editor property if a valid value is received", () => {
		const original = deepFreeze( {
			2916284: {
				ID: 2916284,
				name: 'WordPress.com Example Blog',
				editor: 'classic',
			},
		} );
		const state = items( original, {
			type: EDITOR_TYPE_SET,
			siteId: 2916284,
			editor: 'gutenberg',
		} );

		expect( state ).to.eql( {
			2916284: {
				ID: 2916284,
				name: 'WordPress.com Example Blog',
				editor: 'gutenberg',
			},
		} );
	} );

	test( "should not update the given site's editor property if an invalid value is received", () => {
		const original = deepFreeze( {
			2916284: {
				ID: 2916284,
				name: 'WordPress.com Example Blog',
				editor: 'gutenberg',
			},
		} );
		const state = items( original, {
			type: EDITOR_TYPE_SET,
			siteId: 2916284,
			editor: 'puppers',
		} );

		expect( state ).to.eql( original );
	} );
} );
