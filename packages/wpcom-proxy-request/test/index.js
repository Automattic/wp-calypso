import { before } from 'node:test';
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
					it( '[v1] should get `WordPress` blog post info', () => {
						return new Promise( ( done ) => {
							proxy(
								{
									path: `/sites/${ siteDomain }/posts/${ postId }`,
									apiVersion: apiVersion,
								},
								( error, body, headers ) => {
									// error
									expect( error ).toBe( null );

									// body
									expect( body ).toBeTruthy();
									expect( body.ID ).toBe( expect.any( Number ) );
									expect( body.ID ).toEqual( postId );
									expect( body.site_ID ).toBe( expect.any( Number ) );
									expect( body.site_ID ).toEqual( siteId );

									// headers
									expect( headers ).toBeTruthy();
									expect( headers.status ).toEqual( 200 );

									done();
								}
							);
						} );
					} );

					it( '[v1] should get `me` user', () => {
						return new Promise( ( done ) => {
							proxy(
								{
									path: '/me',
									apiVersion: apiVersion,
								},
								( error, body, headers ) => {
									// error
									expect( error ).toBe( null );

									// body
									expect( body.ID ).toBeTruthy();
									expect( body.ID ).toBe( expect.any( Number ) );
									expect( body.username ).toBeTruthy();

									// headers
									expect( headers ).toBeTruthy();

									done();
								}
							);
						} );
					} );
				} );

				describe( 'wrong requests', () => {
					it( '[v1] should get `404` for a non-exiting route', () => {
						return new Promise( ( done ) => {
							proxy(
								{
									path: '/this-route-does-not-exists',
								},
								( error, body, headers ) => {
									expect( error ).toBeTruthy();
									expect( error.name ).toEqual( 'NotFoundError' );
									expect( error.message ).toBeTruthy();
									expect( error.statusCode ).toEqual( 404 );

									// error
									expect( error ).toBeTruthy();

									// body
									expect( body ).toBeFalsy();

									// headers
									expect( headers ).toBeTruthy();
									expect( headers.status ).toEqual( 404 );

									done();
								}
							);
						} );
					} );

					it( '[v1] should get `404` for a non-exiting site', () => {
						return new Promise( ( done ) => {
							proxy(
								{
									path: '/sites/this-site-does-not-exit-i-hope',
									apiVersion: apiVersion,
								},
								( error, body, headers ) => {
									// error
									expect( error ).toBeTruthy();
									expect( error.name ).toEqual( 'UnknownBlogError' );
									expect( error.message ).toBeTruthy();
									expect( error.statusCode ).toEqual( 404 );

									// body
									expect( body ).toBeFalsy();

									// headers
									expect( headers ).toBeTruthy();
									expect( headers.status ).toEqual( 404 );

									done();
								}
							);
						} );
					} );

					it( '[v1] should get `404` for a non-exiting post', () => {
						return new Promise( ( done ) => {
							proxy(
								{
									path: `/sites/${ siteDomain }/posts/0`,
									apiVersion: apiVersion,
								},
								( error, body, headers ) => {
									// error
									expect( error ).toBeTruthy();
									expect( error.name ).toEqual( 'UnknownPostError' );
									expect( error.message ).toBeTruthy();
									expect( error.statusCode ).toEqual( 404 );

									// body
									expect( body ).toBeFalsy();

									// headers
									expect( headers ).toBeTruthy();
									expect( headers.status ).toEqual( 404 );

									done();
								}
							);
						} );
					} );
				} );
			} );
		} );

		describe( 'WP-API', () => {
			describe( 'wp/v2', () => {
				const namespace = 'wp/v2';

				describe( 'successful requests', () => {
					it( '[wp/v2] should get `me` user', () => {
						return new Promise( ( done ) => {
							proxy(
								{
									path: `/sites/${ siteDomain }/users/me`,
									apiNamespace: namespace,
								},
								( error, body, headers ) => {
									// error
									expect( error ).toBe( null );

									// body
									expect( body.name ).toBeTruthy();
									expect( body.link ).toBeTruthy();

									// headers
									expect( headers ).toBeTruthy();

									done();
								}
							);
						} );
					} );
				} );

				describe( 'wrong requests', () => {
					it( '[wp/v2] should get `404` for a non-exiting route', () => {
						return new Promise( ( done ) => {
							proxy(
								{
									path: '/this-route-does-not-exists',
									apiNamespace: namespace,
								},
								( error, body, headers ) => {
									// error
									expect( error ).toBeTruthy();
									expect( error.name ).toEqual( 'RestNoRouteError' );
									expect( error.statusCode ).toEqual( 404 );
									expect( error.message ).toEqual(
										'No route was found matching the URL and request method'
									);

									// body
									expect( body ).toBeFalsy();

									// headers
									expect( headers ).toBeTruthy();
									expect( headers.status ).toEqual( 404 );

									done();
								}
							);
						} );
					} );

					it( '[wp/v2] should get `404` a non-existing post', () => {
						return new Promise( ( done ) => {
							proxy(
								{
									path: '/sites/retrofocs.wordpress.com/posts/0',
									apiNamespace: namespace,
								},
								( error, body, headers ) => {
									// error
									expect( error ).toBeTruthy();
									expect( error.name ).toEqual( 'RestPostInvalidIdError' );
									expect( error.statusCode ).toEqual( 404 );
									expect( error.message ).toEqual( 'Invalid post ID.' );

									// body
									expect( body ).toBeFalsy();

									// headers
									expect( headers ).toBeTruthy();
									expect( headers.status ).toEqual( 404 );

									done();
								}
							);
						} );
					} );
				} );
			} );

			describe( 'wpcom/v2', () => {
				const namespace = 'wpcom/v2';

				describe( 'successful requests', () => {
					it( '[wpcom/v2] should get timezones list', function () {
						return new Promise( ( done ) => {
							proxy(
								{
									path: '/timezones',
									apiNamespace: namespace,
								},
								( error, body ) => {
									// error
									expect( error ).toBe( null );

									// body
									expect( body.found ).toBeTruthy();
									expect( body.timezones ).toBe( expect.any( Array ) );

									done();
								}
							);
						} );
					} );
				} );

				describe( 'wrong requests', () => {
					it( '[wpcom/v2] should get `404` for a non-exiting route', () => {
						return new Promise( ( done ) => {
							proxy(
								{
									path: '/this-route-does-not-exists',
									apiNamespace: namespace,
								},
								( error, body, headers ) => {
									// error
									expect( error ).toBeTruthy();
									expect( error.name ).toEqual( 'RestNoRouteError' );
									expect( error.statusCode ).toEqual( 404 );
									expect( error.message ).toEqual(
										'No route was found matching the URL and request method'
									);

									// body
									expect( body ).toBeFalsy();

									// headers
									expect( headers ).toBeTruthy();
									expect( headers.status ).toEqual( 404 );

									done();
								}
							);
						} );
					} );
				} );
			} );
		} );
	} );
} );
