export default (
	titleFormats,
	type,
	{ site, post = {}, tag = '', date = '', archiveTitle = '' }
) => {
	const processPiece = ( piece = {}, data ) =>
		'string' === piece.type ? piece.value : data[ piece.type ] ?? '';

	const buildTitle = ( format, data ) =>
		( titleFormats[ format ] ?? [] ).map( ( piece ) => processPiece( piece, data ) ).join( '' );

	switch ( type ) {
		case 'frontPage':
			return (
				buildTitle( 'frontPage', {
					siteName: site.name,
					tagline: site.description,
				} ) || site.name
			);

		case 'posts':
			return (
				buildTitle( 'posts', {
					siteName: site.name,
					tagline: site.description,
					postTitle: post?.title ?? '',
				} ) ||
				post?.title ||
				''
			);

		case 'pages':
			return buildTitle( 'pages', {
				siteName: site.name,
				tagline: site.description,
				pageTitle: post?.title ?? '',
			} );

		case 'groups':
			return buildTitle( 'groups', {
				siteName: site.name,
				tagline: site.description,
				groupTitle: tag,
			} );

		case 'archives':
			return buildTitle( 'archives', {
				siteName: site.name,
				tagline: site.description,
				date: date,
				archiveTitle: archiveTitle,
			} );

		default:
			return post?.title || site.name;
	}
};
