/* eslint-disable no-console */

/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import proxy from '../';

/**
 * Expose proxy for development purpose
 */
window.proxy = proxy;

describe( 'wpcom-proxy-request', () => {
	const siteDomain = 'en.blog.wordpress.com';
	const siteId = 3584907;
	const postId = 35600;

	// run the proxy
	before( done => {
		proxy( { metaAPI: { accessAllUsersBlogs: true } }, err => {
			if ( err ) {
				throw err;
			}

			console.log( 'proxy now running in "access all user\'s blogs" mode' );
			done();
		} );
	} );

	describe( 'REST-API v1', () => {
		const apiVersion = '1';

		describe( 'successful requests', () => {
			it( 'should get `WordPress` blog post info', done => {
				proxy( {
					path: `/sites/${ siteDomain }/posts/${ postId }`,
					apiVersion: apiVersion
				}, ( error, body, headers ) => {
					expect( error ).to.be.an( 'null' );
					expect( body ).to.be.ok;
					expect( body.ID ).to.be.a( 'number' );
					expect( body.ID ).to.be.equal( postId );
					expect( body.site_ID ).to.be.a( 'number' );
					expect( body.site_ID ).to.be.equal( siteId );
					expect( headers ).to.be.ok;
					expect( headers.status ).to.be.equal( 200 );
					done();
				} );
			} );

			it( 'should get `me` user', done => {
				proxy( {
					path: '/me',
					apiVersion: apiVersion
				}, ( error, body, headers ) => {
					expect( error ).to.be.an( 'null' );
					expect( body.ID ).to.be.ok;
					expect( body.ID ).to.be.a( 'number' );
					expect( body.username ).to.be.ok;
					expect( headers ).to.be.ok;
					done();
				} );
			} );
		} );

		describe( 'wrong requests', () => {
			it( 'should get `404` for a non-exiting route', done => {
				proxy( {
					path: '/this-route-does-not-exists'
				}, ( error, body, headers ) => {
					expect( error ).to.be.ok;
					expect( body ).to.be.not.ok;
					expect( headers ).to.be.ok;
					expect( headers.status ).to.be.equal( 404 );
					done();
				} );
			} );

			it( 'should get `404` for a non-exiting post', done => {
				proxy( {
					path: `/sites/${ siteDomain }/posts/0`,
					apiVersion: apiVersion
				}, ( error, body, headers ) => {
					expect( error ).to.be.ok;
					expect( body ).to.be.not.ok;
					expect( headers ).to.be.ok;
					expect( headers.status ).to.be.equal( 404 );
					done();
				} );
			} );
		} );
	} );

	describe( 'WP-API wp/v2', () => {
		const namespace = 'wp/v2';

		describe( 'successful requests', () => {
			it( 'should get `me` user', done => {
				proxy( {
					path: `/sites/${ siteDomain }/users/me`,
					apiNamespace: namespace
				}, ( error, body, headers ) => {
					expect( error ).to.be.an( 'null' );
					expect( body.name ).to.be.ok;
					expect( body.link ).to.be.ok;
					expect( headers ).to.be.ok;
					done();
				} );
			} );
		} );

		describe( 'wrong requests', () => {
			it( 'should get `404` for a non-exiting route', done => {
				proxy( {
					path: '/this-route-does-not-exists',
					apiNamespace: namespace
				}, ( error, body, headers ) => {
					expect( error ).to.be.ok;
					expect( body ).to.be.not.ok;
					expect( headers ).to.be.ok;
					expect( headers.status ).to.be.equal( 404 );
					done();
				} );
			} );

			it( 'should get `404` a non-existing post', done => {
				proxy( {
					path: '/sites/retrofocs.wordpress.com/posts/0',
					apiNamespace: namespace
				}, ( error, body, headers ) => {
					expect( error ).to.be.ok;
					expect( body ).to.be.not.ok;
					expect( headers ).to.be.ok;
					expect( headers.status ).to.be.equal( 404 );
					done();
				} );
			} );
		} );
	} );

	describe( 'WP-API wpcom/v2', () => {
		const namespace = 'wpcom/v2';

		describe( 'successful requests', () => {
			it( 'should get timezones list', function( done ) {
				proxy( {
					path: '/timezones',
					apiNamespace: namespace
				}, ( error, body ) => {
					expect( error ).to.be.an( 'null' );
					expect( body.found ).to.be.ok;
					expect( body.timezones ).to.be.an( 'array' );
					done();
				} );
			} );
		} );

		describe( 'wrong requests', () => {
			it( 'should get `404` for a non-exiting route', done => {
				proxy( {
					path: '/this-route-does-not-exists',
					apiNamespace: namespace
				}, ( error, body, headers ) => {
					expect( error ).to.be.ok;
					expect( body ).to.be.not.ok;
					expect( headers ).to.be.ok;
					expect( headers.status ).to.be.equal( 404 );
					done();
				} );
			} );

			it( 'should get `404` a non-existing post', done => {
				proxy( {
					path: '/sites/retrofocs.wordpress.com/posts/0',
					apiNamespace: namespace
				}, ( error, body, headers ) => {
					expect( error ).to.be.ok;
					expect( body ).to.be.not.ok;
					expect( headers ).to.be.ok;
					expect( headers.status ).to.be.equal( 404 );
					done();
				} );
			} );
		} );
	} );
} );
