/**
 * External Dependencies
 */
import page from 'page';

export default function() {
	var loading = false;
	page( '/posts/:author?/:status?/:domain?', function( context, next ) {
		if ( loading ) {
			next();
			return;
		}
		loading = true;
		require.ensure( ['my-sites/controller', './controller' ], function( req ) {
			var controller = req( 'my-sites/controller' ),
				postsController = req( './controller' );

			page( '/posts/:author?/:status?/:domain?',
				controller.siteSelection,
				controller.navigation,
				postsController.posts );

			next();
		}, 'posts-pages' );
	} );
};
