import { expect } from 'chai';

import {
	nativeToRaw,
	rawToNative
} from '../mappings';

describe( 'SEO', () => {
	describe( 'Meta', () => {
		describe( 'Title Format Editor', () => {
			describe( '#nativeToRaw', () => {
				it( 'should produce empty strings', () => expect(
					nativeToRaw( [] )
				).to.equal( '' ) );

				it( 'should produce plain-text strings', () => expect(
					nativeToRaw( [
						{ type: 'string', value: 'just' },
						{ type: 'string', value: ' a ' },
						{ type: 'string', value: 'string' }
					] )
				).to.equal( 'just a string' ) );

				it( 'should produce placeholders', () => expect(
					nativeToRaw( [
						{ type: 'siteName' },
						{ type: 'string', value: ' | ' },
						{ type: 'postTitle' }
					] )
				).to.equal( '%site_name% | %post_title%' ) );
			} );

			describe( '#rawToNative', () => {
				it( 'should handle empty strings', () => expect(
					rawToNative( '' )
				).to.eql( [] ) );

				it( 'should handle plain strings', () => expect(
					rawToNative( 'just a string' )
				).to.eql( [ { type: 'string', value: 'just a string' } ] ) );

				it( 'should handle placeholders', () => expect(
					rawToNative( '%site_name% | %post_title%' )
				).to.eql( [
					{ type: 'siteName' },
					{ type: 'string', value: ' | ' },
					{ type: 'postTitle' }
				] ) );
			} );
		} );
	} );
} );
