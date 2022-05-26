export default function ( router ) {
	router( [ '/marketing/do-it-for-me', '/marketing/do-it-for-me/*' ], ( { res } ) => {
		res.redirect( 301, 'https://wordpress.com/do-it-for-me/' );
	} );
}
