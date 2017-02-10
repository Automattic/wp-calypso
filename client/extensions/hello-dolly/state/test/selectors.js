/**
 * External dependencies
 */
import chai from 'chai';

/**
 * Internal dependencies
 */
import lyrics from '../lyrics';
import { getCurrentLyric } from '../selectors';

const should = chai.should();

describe( 'selectors', () => {
	it( 'should retrieve the current lyric', () => {
		const last = lyrics.length - 1;

		should.equal( getCurrentLyric( { helloDolly: { lyricIndex: 0 } } ), lyrics[ 0 ] );
		should.equal( getCurrentLyric( { helloDolly: { lyricIndex: 3 } } ), lyrics[ 3 ] );
		should.equal( getCurrentLyric( { helloDolly: { lyricIndex: last } } ), lyrics[ last ] );
		should.equal( getCurrentLyric( { helloDolly: { lyricIndex: -1 } } ), undefined );
		should.equal( getCurrentLyric( { helloDolly: { lyricIndex: lyrics.length } } ), undefined );
	} );
} );

