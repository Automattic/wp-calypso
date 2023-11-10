import page from '@automattic/calypso-router';

/**
 * Redirects to the specified path.
 * @param path The path to redirect to.
 */
export const redirectPage = ( path: string ) => {
	page( path );
};
