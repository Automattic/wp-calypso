import { URL } from 'url';
import { Page } from 'playwright';
import { getCalypsoURL, parseSiteHostFromUrl } from '../../data-helper';

type IsUrlMatch = ( url: string ) => boolean;
type TransformUrl = ( url: string ) => string;
type UrlTransformationTable = [ IsUrlMatch, TransformUrl ][];

const isGutenframePostEditor: IsUrlMatch = ( url: string ) => {
	const urlPath = new URL( url ).pathname;
	return /\/(post|page)\/.+/.test( urlPath );
};

const isGutenframeSiteEditor = ( url: string ) => {
	const urlPath = new URL( url ).pathname;
	return /\/(site-editor)\/.+/.test( urlPath );
};

const isClassicPostCollection: IsUrlMatch = ( url: string ) => {
	const urlPath = new URL( url ).pathname;
	return /\/wp-admin\/edit\.php.*/.test( urlPath );
};

const isClassicAdminHome: IsUrlMatch = ( url: string ) => {
	return new URL( url ).pathname === '/wp-admin/index.php';
};

const transformToClassicPostEditor: TransformUrl = ( url: string ) => {
	const originalUrl = new URL( url );
	const siteHost = parseSiteHostFromUrl( url );
	const transformedUrl = new URL( `https://${ siteHost }` );
	transformedUrl.searchParams.append( 'calypsoify', '1' ); // all routes get this param

	const lastPathPiece = originalUrl.pathname.split( '/' ).pop();
	const isNumericRegex = /^\d+$/;
	const pathEndsInPostId = lastPathPiece && isNumericRegex.test( lastPathPiece );

	if ( pathEndsInPostId ) {
		transformedUrl.pathname = 'wp-admin/post.php';

		const existingPostId = lastPathPiece;
		transformedUrl.searchParams.append( 'post', existingPostId );
		transformedUrl.searchParams.append( 'action', 'edit' );
	} else {
		transformedUrl.pathname = 'wp-admin/post-new.php';

		const firstPathPiece = originalUrl.pathname.split( '/' )[ 1 ]; // 0 index will be empty string
		const postType = firstPathPiece === 'page' ? 'page' : 'post';
		transformedUrl.searchParams.append( 'post_type', postType );
	}

	return transformedUrl.href;
};

const transformToClassicSiteEditor: TransformUrl = ( url: string ) => {
	const siteHost = parseSiteHostFromUrl( url );
	const transformedUrl = new URL( `https://${ siteHost }` );
	transformedUrl.pathname = 'wp-admin/themes.php';
	transformedUrl.searchParams.set( 'page', 'gutenberg-edit-site' );
	return transformedUrl.href;
};

const transformToCalypsoPostCollection: TransformUrl = ( url: string ) => {
	const originalUrl = new URL( url );
	const siteHost = parseSiteHostFromUrl( url );
	const postTypeParam = originalUrl.searchParams.get( 'post_type' );
	const calypsoPathStart = postTypeParam === 'page' ? 'pages' : 'posts';

	return getCalypsoURL( `/${ calypsoPathStart }/${ siteHost }` );
};

const transformToCalypsoHome: TransformUrl = ( url: string ) => {
	const siteHost = parseSiteHostFromUrl( url );
	return getCalypsoURL( `/home/${ siteHost }` );
};

const editorUrlTransformationTable: UrlTransformationTable = [
	[ isGutenframePostEditor, transformToClassicPostEditor ],
	[ isGutenframeSiteEditor, transformToClassicSiteEditor ],
	[ isClassicPostCollection, transformToCalypsoPostCollection ],
	[ isClassicAdminHome, transformToCalypsoHome ],
];

// Exported for unit testing
export const transformEditorRelatedUrls = ( url: string ) => {
	if ( ! url ) {
		return '';
	}

	for ( const [ isUrlMatch, transformUrl ] of editorUrlTransformationTable ) {
		if ( isUrlMatch( url ) ) {
			return transformUrl( url );
		}
	}

	return url;
};

/**
 * Implements a Playwright router that intercepts all editor related URL routing
 * (e.g. into the editor, and back to the /posts or /pages pages ) and redirects to
 * the URLs we want for Atomic testing.
 *
 * @param page Playwright page
 */
export async function hardCodeAtomicEditorRouting( page: Page ): Promise< void > {
	// if ( ! envVariables.TEST_ON_ATOMIC ) {
	// 	return;
	// }

	page.route( /\/wp-admin\/edit\.php.*/, ( route, request ) => {
		const url = transformToCalypsoPostCollection( request.url() );
		route.continue( { url } );
	} );
}
