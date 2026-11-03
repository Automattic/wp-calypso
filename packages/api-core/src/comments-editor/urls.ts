/**
 * The editor's embed preview route, which belongs to the site the comment goes to.
 */
export const commentsEmbedUrl = ( siteId: number ) =>
	`https://public-api.wordpress.com/wpcom/v2/sites/${ encodeURIComponent( siteId ) }/comments/embed`;
