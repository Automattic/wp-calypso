/**
 * External dependencies
 */
import { equal } from 'assert';

/**
 * Internal dependencies
 */
import blockquoteNormaliser from '../blockquote-normaliser';
import { deepFilterHTML } from '../utils';

describe( 'blockquoteNormaliser', () => {
	it( 'should normalise blockquote', () => {
		const input = '<blockquote>test</blockquote>';
		const output = '<blockquote><p>test</p></blockquote>';
		equal( deepFilterHTML( input, [ blockquoteNormaliser ] ), output );
	} );
} );
