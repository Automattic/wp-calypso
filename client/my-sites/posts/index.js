/**
 * External Dependencies
 *
 * @format
 */

import page from 'page';

/**
 * Internal Dependencies
 */
import { siteSelection, navigation } from 'my-sites/controller';
import postsController from './controller';

export default function() {
	page( '/posts/:author?/:status?/:domain?', siteSelection, navigation, postsController.posts );
}
