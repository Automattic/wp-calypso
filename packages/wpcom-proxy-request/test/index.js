/* eslint-disable no-console */

/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import proxy, { reloadProxy } from '../';

/**
 * Expose proxy for development purpose
 */
window.proxy = proxy;

const runs = [ { shouldReloadProxy: false }, { shouldReloadProxy: true } ];

runs.forEach( ( { shouldReloadProxy } ) => {
	let description = '';
	if ( shouldReloadProxy ) {
		description = ' (after proxy has been reloaded)';
	}
	describe( 'wpcom-proxy-request' + description, () => {
		const siteDomain = 'en.blog.wordpress.com';
		const siteId = 3584907;
		const postId = 35600;

		// run the proxy
		before( ( done ) => {
			if ( shouldReloadProxy ) {
				reloadProxy();
			}
			proxy( { metaAPI: { accessAllUsersBlogs: true } }, ( err ) => {
				if ( err ) {
					throw err;
				}

				if ( shouldReloadProxy ) {
					console.log( 'proxy reloaded' );
				}
				console.log( 'proxy now running in "access all user\'s blogs" mode' );
				done();
			} );
		} );

		describe( 'REST-API', () => {
			const apiVersion = '1';

			describe( 'v1', () => {
				describe( 'successful requests', () => {
					it( '[v1] should get `WordPress` blog post info', ( done ) => {
						proxy(
							{
								path: `/sites/${ siteDomain }/posts/${ postId }`,
								apiVersion: apiVersion,
							},
							( error, body, headers ) => {
								// error
								expect( error ).to.be.an( 'null' );

								// body
								expect( body ).to.be.ok;
								expect( body.ID ).to.be.a( 'number' );
								expect( body.ID ).to.be.equal( postId );
								expect( body.site_ID ).to.be.a( 'number' );
								expect( body.site_ID ).to.be.equal( siteId );

								// headers
								expect( headers ).to.be.ok;
								expect( headers.status ).to.be.equal( 200 );

								done();
							}
						);
					} );

					it( '[v1] should get `me` user', ( done ) => {
						proxy(
							{
								path: '/me',
								apiVersion: apiVersion,
							},
							( error, body, headers ) => {
								// error
								expect( error ).to.be.an( 'null' );

								// body
								expect( body.ID ).to.be.ok;
								expect( body.ID ).to.be.a( 'number' );
								expect( body.username ).to.be.ok;

								// headers
								expect( headers ).to.be.ok;

								done();
							}
						);
					} );
				} );

				describe( 'wrong requests', () => {
					it( '[v1] should get `404` for a non-exiting route', ( done ) => {
						proxy(
							{
								path: '/this-route-does-not-exists',
							},
							( error, body, headers ) => {
								expect( error ).to.be.ok;
								expect( error.name ).to.be.equal( 'NotFoundError' );
								expect( error.message ).to.be.ok;
								expect( error.statusCode ).to.be.equal( 404 );

								// error
								expect( error ).to.be.ok;

								// body
								expect( body ).to.be.not.ok;

								// headers
								expect( headers ).to.be.ok;
								expect( headers.status ).to.be.equal( 404 );

								done();
							}
						);
					} );

					it( '[v1] should get `404` for a non-exiting site', ( done ) => {
						proxy(
							{
								path: '/sites/this-site-does-not-exit-i-hope',
								apiVersion: apiVersion,
							},
							( error, body, headers ) => {
								// error
								expect( error ).to.be.ok;
								expect( error.name ).to.be.equal( 'UnknownBlogError' );
								expect( error.message ).to.be.ok;
								expect( error.statusCode ).to.be.equal( 404 );

								// body
								expect( body ).to.be.not.ok;

								// headers
								expect( headers ).to.be.ok;
								expect( headers.status ).to.be.equal( 404 );

								done();
							}
						);
					} );

					it( '[v1] should get `404` for a non-exiting post', ( done ) => {
						proxy(
							{
								path: `/sites/${ siteDomain }/posts/0`,
								apiVersion: apiVersion,
							},
							( error, body, headers ) => {
								// error
								expect( error ).to.be.ok;
								expect( error.name ).to.be.equal( 'UnknownPostError' );
								expect( error.message ).to.be.ok;
								expect( error.statusCode ).to.be.equal( 404 );

								// body
								expect( body ).to.be.not.ok;

								// headers
								expect( headers ).to.be.ok;
								expect( headers.status ).to.be.equal( 404 );

								done();
							}
						);
					} );
				} );
			} );
		} );

		describe( 'WP-API', () => {
			describe( 'wp/v2', () => {
				const namespace = 'wp/v2';

				describe( 'successful requests', () => {
					it( '[wp/v2] should get `me` user', ( done ) => {
						proxy(
							{
								path: `/sites/${ siteDomain }/users/me`,
								apiNamespace: namespace,
							},
							( error, body, headers ) => {
								// error
								expect( error ).to.be.an( 'null' );

								// body
								expect( body.name ).to.be.ok;
								expect( body.link ).to.be.ok;

								// headers
								expect( headers ).to.be.ok;

								done();
							}
						);
					} );
				} );

				describe( 'wrong requests', () => {
					it( '[wp/v2] should get `404` for a non-exiting route', ( done ) => {
						proxy(
							{
								path: '/this-route-does-not-exists',
								apiNamespace: namespace,
							},
							( error, body, headers ) => {
								// error
								expect( error ).to.be.ok;
								expect( error.name ).to.be.equal( 'RestNoRouteError' );
								expect( error.statusCode ).to.be.equal( 404 );
								expect( error.message ).to.be.equal(
									'No route was found matching the URL and request method'
								);

								// body
								expect( body ).to.be.not.ok;

								// headers
								expect( headers ).to.be.ok;
								expect( headers.status ).to.be.equal( 404 );

								done();
							}
						);
					} );

					it( '[wp/v2] should get `404` a non-existing post', ( done ) => {
						proxy(
							{
								path: '/sites/retrofocs.wordpress.com/posts/0',
								apiNamespace: namespace,
							},
							( error, body, headers ) => {
								// error
								expect( error ).to.be.ok;
								expect( error.name ).to.be.equal( 'RestPostInvalidIdError' );
								expect( error.statusCode ).to.be.equal( 404 );
								expect( error.message ).to.be.equal( 'Invalid post ID.' );

								// body
								expect( body ).to.be.not.ok;

								// headers
								expect( headers ).to.be.ok;
								expect( headers.status ).to.be.equal( 404 );

								done();
							}
						);
					} );
				} );
			} );

			describe( 'wpcom/v2', () => {
				const namespace = 'wpcom/v2';

				describe( 'successful requests', () => {
					it( '[wpcom/v2] should get timezones list', function ( done ) {
						proxy(
							{
								path: '/timezones',
								apiNamespace: namespace,
							},
							( error, body ) => {
								// error
								expect( error ).to.be.an( 'null' );

								// body
								expect( body.found ).to.be.ok;
								expect( body.timezones ).to.be.an( 'array' );

								done();
							}
						);
					} );
				} );

				describe( 'wrong requests', () => {
					it( '[wpcom/v2] should get `404` for a non-exiting route', ( done ) => {
						proxy(
							{
								path: '/this-route-does-not-exists',
								apiNamespace: namespace,
							},
							( error, body, headers ) => {
								// error
								expect( error ).to.be.ok;
								expect( error.name ).to.be.equal( 'RestNoRouteError' );
								expect( error.statusCode ).to.be.equal( 404 );
								expect( error.message ).to.be.equal(
									'No route was found matching the URL and request method'
								);

								// body
								expect( body ).to.be.not.ok;

								// headers
								expect( headers ).to.be.ok;
								expect( headers.status ).to.be.equal( 404 );

								done();
							}
						);
					} );
				} );
			} );
		} );
	} );
} );
