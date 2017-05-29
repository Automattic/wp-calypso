/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { getThemeFilterToTermTable } from '../';
import { state } from './fixtures/theme-filters';

describe( 'getThemeFilterToTermTable()', () => {
	it( 'should return a dictionary mapping taxomomy-prefixed terms to unprefixed terms (except for ambiguous terms)', () => {
		const table = getThemeFilterToTermTable( state );
		expect( table ).to.deep.equal( {
			'subject:artwork': 'artwork',
			'subject:blog': 'blog',
			'subject:business': 'business',
			'subject:music': 'music',
			'subject:video': 'subject:video',
			'style:artistic': 'artistic',
			'style:bright': 'bright',
			'style:clean': 'clean',
			'style:minimal': 'minimal',
			'feature:video': 'feature:video',
			'feature:wordads': 'wordads',
		} );
	} );
} );
