/**
 * External Dependencies
 */
import page from 'page';

/**
 * Internal Dependencies
 */
import controller from 'my-sites/controller';
import postsController from './controller';

export default function() {
	page( '/posts/:author?/:status?/:domain?',
		controller.siteSelection,
		controller.navigation,
		postsController.posts
	);
}
