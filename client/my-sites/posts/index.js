/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import postsController from './controller';
import controller from 'my-sites/controller';

export default function() {
	page( '/posts/:author?/:status?/:domain?',
		controller.siteSelection,
		controller.navigation,
		postsController.posts
	);
}
