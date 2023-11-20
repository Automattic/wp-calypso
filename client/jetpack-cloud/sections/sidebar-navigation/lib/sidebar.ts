import page from 'page';
import { itemLinkMatches } from 'calypso/my-sites/sidebar/utils';
import {
	JETPACK_MANAGE_ASSIGN_LICENCE_LINK,
	JETPACK_MANAGE_ISSUE_LICENCE_LINK,
	JETPACK_MANAGE_LICENCES_LINK,
} from './constants';

/**
 * Determines whether a menu item should be selected based on the current URL path.
 * @param link The link to compare against the current URL path.
 * @param path The current URL path.
 * @returns A boolean value indicating whether the link matches the current URL path.
 */
export const isMenuItemSelected = ( link: string, path: string ) => {
	let overridenPath = path;

	// For Assign and Issue license path, we will override it to be license path to make the menu selected.
	if (
		( link === JETPACK_MANAGE_LICENCES_LINK &&
			path.startsWith( JETPACK_MANAGE_ASSIGN_LICENCE_LINK ) ) ||
		path.startsWith( JETPACK_MANAGE_ISSUE_LICENCE_LINK )
	) {
		overridenPath = JETPACK_MANAGE_LICENCES_LINK;
	}

	return itemLinkMatches( link, overridenPath );
};

/**
 * Redirects to the specified path.
 * @param path The path to redirect to.
 */
export const redirectPage = ( path: string ) => {
	page( path );
};
