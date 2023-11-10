import page from '@automattic/calypso-router';
import { itemLinkMatches } from 'calypso/my-sites/sidebar/utils';

/**
 * Determines whether a menu item should be selected based on the current URL path.
 * @param link The link to compare against the current URL path.
 * @returns A boolean value indicating whether the link matches the current URL path.
 */
export const isMenuItemSelected = ( link: string ) => {
	const pathname = window.location.pathname;
	return itemLinkMatches( link, pathname );
};

/**
 * Redirects to the specified path.
 * @param path The path to redirect to.
 */
export const redirectPage = ( path: string ) => {
	page( path );
};
