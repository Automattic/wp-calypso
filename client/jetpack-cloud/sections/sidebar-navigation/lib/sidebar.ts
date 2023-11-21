import page from 'page';
/**
 * Redirects to the specified path.
 * @param path The path to redirect to.
 */
export const redirectPage = ( path: string ) => {
	page( path );
};
