/**
 * External dependencies
 */
import { DataHelper, LoginFlow, MyHomePage } from '@automattic/calypso-e2e';

describe( DataHelper.createSuiteTitle( 'Logmein' ), function () {
	describe( 'Like an existing post', function () {
		it( 'Log in', async function () {
			const loginFlow = new LoginFlow( this.page, 'louisTestUser' );
			await loginFlow.logIn();
		} );

		it( 'Visit site', async function () {
			const visited = [];
			this.page.on( 'request', ( request ) => {
				const url = request.url();
				if ( url.match( /^https:\/\/c3polikes\.blog/ ) ) {
					visited.push( url );
					const from = request.redirectedFrom();
					if ( from ) {
						visited.push( from.url() );
					}
				}
			} );
			// this.page.route( '**', ( route ) => {
			// 	const url = route.request().url();
			// 	if ( url.match( /c3polikes\.blog/ ) ) {
			// 		visited.push( url );
			// 		visited.push( request.redirectedFrom().url() );
			// 	}
			// 	route.continue();
			// } );

			const myHomePage = await MyHomePage.Expect( this.page );
			await myHomePage.visitSite();

			console.log( visited );
		} );
	} );
} );
