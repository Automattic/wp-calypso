export default function ( router ) {
	router( [ '/marketing/do-it-for-me', '/marketing/do-it-for-me/*' ], ( { res } ) => {
		res.redirect( 301, 'https://wordpress.com/do-it-for-me/' );
	} );

	router(
		[ '/marketing/ultimate-traffic-guide', '/marketing/ultimate-traffic-guide/*' ],
		( { res } ) => {
			res.redirect( 301, 'https://wpcourses.com/course/intro-to-search-engine-optimization-seo/' );
		}
	);
}
