/**
 * External dependencies
 */
import assert from 'assert';

/**
 * Internal dependencies
 */
import util from './util';

/**
 * wpcom.batch
 */

describe( 'wpcom.batch', () => {
	it( 'should makes several data in only one request', () => {
		return new Promise( ( done ) => {
			const wpcom = util.wpcom();
			const batch = wpcom.batch();
			const site = wpcom.site( util.site() );

			const url_site = `/sites/${ site._id }`;
			const url_posts = `/sites/${ site._id }/posts`;
			const url_me = '/me';

			batch
				.add( url_site )
				.add( url_posts )
				.add( url_me )
				.run()
				.then( ( data ) => {
					assert.ok( data );
					assert.ok( data[ url_site ] );
					assert.ok( data[ url_posts ] );
					assert.ok( data[ url_me ] );
					done();
				} )
				.catch( done );
		} );
	} );
} );
