import { makeLayout } from 'calypso/controller';

export default function ( router ) {
	// Handle redirects on the server.
	router( [ '/marketing/do-it-for-me', '/marketing/do-it-for-me/*' ], ( { res } ) => {
		res.redirect( 301, 'https://wordpress.com/do-it-for-me/' );
	} );
	router(
		[ '/marketing/ultimate-traffic-guide', '/marketing/ultimate-traffic-guide/*' ],
		( { res } ) => {
			res.redirect( 301, 'https://wpcourses.com/course/intro-to-search-engine-optimization-seo/' );
		}
	);

	// Otherwise, use client-side routing.
	router( [ '/marketing', '/marketing/*', '/sharing', '/sharing/*' ], makeLayout );
}
