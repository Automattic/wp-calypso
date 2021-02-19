/**
 * Module dependencies
 */
const util = require( './util' );
const assert = require( 'assert' );

/**
 * wpcom.site.post.subscriber
 */
describe( 'wpcom.site.wordads', function () {
	// Global instances
	const wpcom = util.wpcom();
	const site = wpcom.site( util.wordAds().site );

	describe( 'wpcom.site.wordads.settings', function () {
		const wordAdsSettings = site.wordAds().settings();

		describe( 'wpcom.site.wordads.settings.get', function () {
			it( 'should get site wordAds settings', function () {
				return new Promise( ( done ) => {
					wordAdsSettings.get( function ( err, data ) {
						if ( err ) throw err;

						assert.equal( 'number', typeof data.ID );
						assert.equal( 'object', typeof data.settings );
						done();
					} );
				} );
			} );
		} );

		describe( 'wpcom.site.wordads.settings.update', function () {
			it( 'should update WordAds settings of the site', function () {
				return new Promise( ( done ) => {
					let settings = {};

					wordAdsSettings.get( function ( err, data ) {
						if ( err ) throw err;

						settings = data.settings;
						settings.taxid = data.settings.taxid_last4;

						wordAdsSettings.update( settings, function ( err2, data2 ) {
							if ( err2 ) throw err2;

							for ( const k in data2.updated ) {
								assert.equal( data2.updated[ k ], settings[ k ] );
							}

							done();
						} );
					} );
				} );
			} );
		} );
	} );

	describe( 'wpcom.site.wordads.earnings', function () {
		const wordAdsEarnings = site.wordAds().earnings();

		describe( 'wpcom.site.wordads.earnings.get', function () {
			it( 'should get site wordAds earnings', function () {
				return new Promise( ( done ) => {
					wordAdsEarnings.get( function ( err, data ) {
						if ( err ) throw err;

						assert.equal( 'number', typeof data.ID );
						assert.equal( 'object', typeof data.earnings );
						done();
					} );
				} );
			} );
		} );
	} );

	describe( 'wpcom.site.wordads.tos', function () {
		const wordAdsTOS = site.wordAds().tos();

		describe( 'wpcom.site.wordads.tos.get', function () {
			it( 'should get site wordAds tos', function () {
				return new Promise( ( done ) => {
					wordAdsTOS.get( function ( err, data ) {
						if ( err ) throw err;

						assert.equal( 'number', typeof data.ID );
						assert.equal( 'string', typeof data.tos );
						done();
					} );
				} );
			} );
		} );

		describe( 'wpcom.site.wordads.tos.update', function () {
			it( 'should update WordAds TOS of the site', function () {
				return new Promise( ( done ) => {
					const send = { tos: 'signed' };

					wordAdsTOS.update( send, function ( err, data ) {
						if ( err ) throw err;

						assert.equal( data.tos, send.tos );
						done();
					} );
				} );
			} );

			it( 'should get error 400 sending wrong body in the request', function () {
				return new Promise( ( done ) => {
					const send = { tos: 'foo' };

					wordAdsTOS.update( send, function ( err ) {
						assert.equal( 'You must agree to the Terms of Service.', err.message );
						done();
					} );
				} );
			} );
		} );

		describe( 'wpcom.site.wordads.tos.sign', function () {
			it( "should sign site's WordAds TOS", function () {
				return new Promise( ( done ) => {
					wordAdsTOS.sign( function ( err, data ) {
						if ( err ) throw err;

						assert.equal( data.tos, 'signed' );
						done();
					} );
				} );
			} );
		} );
	} );
} );
