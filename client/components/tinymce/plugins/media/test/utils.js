/** @format */

/**
 * External dependencies
 */
import { expect } from 'chai';
import { spy } from 'sinon';

/**
 * Internal dependencies
 */
import { insertMediaAsLink } from '../utils';

describe( 'Media button commands', () => {
	let editor, media;

	beforeAll( () => {
		media = {
			URL: '/puppy.gif',
			title: 'When I use " I cause mischief.',
		};
		editor = { execCommand: spy() };
	} );

	describe( '#insertMediaAsLink()', () => {
		test( 'title is escaped', () => {
			insertMediaAsLink( editor, media );
			expect(
				editor.execCommand.args[ 0 ][ 2 ].indexOf( '"When I use &quot; I cause mischief."' ) > -1
			).to.be.true;
		} );
		test( 'selection is text of link', () => {
			insertMediaAsLink( editor, media );
			expect( editor.execCommand.args[ 0 ][ 2 ].indexOf( '>{$selection}<' ) > -1 ).to.be.true;
		} );
	} );
} );
