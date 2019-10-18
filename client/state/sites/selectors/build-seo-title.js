/**
 * External dependencies
 */
import { get } from 'lodash';

export default ( titleFormats, type, { site, post = {}, tag = '', date = '' } ) => {
	const processPiece = ( piece = {}, data ) =>
		'string' === piece.type ? piece.value : get( data, piece.type, '' );

	const buildTitle = ( format, data ) =>
		get( titleFormats, format, [] ).reduce(
			( title, piece ) => title + processPiece( piece, data ),
			''
		);

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
					postTitle: get( post, 'title', '' ),
				} ) || get( post, 'title', '' )
			);

		case 'pages':
			return buildTitle( 'pages', {
				siteName: site.name,
				tagline: site.description,
				pageTitle: get( post, 'title', '' ),
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
			} );

		default:
			return post.title || site.name;
	}
};
