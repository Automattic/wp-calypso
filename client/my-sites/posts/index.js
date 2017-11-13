/** @format */

/**
 * External dependencies
 */

import page from 'page';

/**
 * Internal Dependencies
 */
import { navigation, siteSelection } from 'my-sites/controller';
import postsController from './controller';

export default function() {
	page( '/posts/:author?/:status?/:domain?', siteSelection, navigation, postsController.posts );
}
