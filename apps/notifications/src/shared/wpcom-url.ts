export const sameOriginWpcomUrl = ( path: string ) => {
	const host =
		document.location.host === 'widgets.wp.com' ? 'wordpress.com' : document.location.host;

	return `${ document.location.protocol }//${ host }${ path }`;
};

export const pendingCommentsPath = ( siteId: number ) => `/comments/pending/${ siteId }`;
