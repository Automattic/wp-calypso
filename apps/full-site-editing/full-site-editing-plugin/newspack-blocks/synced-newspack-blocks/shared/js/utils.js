/**
 * WordPress dependencies
 */
import { _x } from '@wordpress/i18n';
import { RawHTML } from '@wordpress/element';

export const formatAvatars = ( authorInfo ) =>
	authorInfo.map( ( author ) => (
		<span className="avatar author-avatar" key={ author.id }>
			<a className="url fn n" href={ author.author_link }>
				<RawHTML>{ author.avatar }</RawHTML>
			</a>
		</span>
	) );

export const formatByline = ( authorInfo ) => (
	<span className="byline">
		{ _x( 'by', 'post author', 'full-site-editing' ) }{ ' ' }
		{ authorInfo.reduce( ( accumulator, author, index ) => {
			return [
				...accumulator,
				<span className="author vcard" key={ author.id }>
					<a className="url fn n" href={ author.author_link }>
						{ author.display_name }
					</a>
				</span>,
				index < authorInfo.length - 2 && ', ',
				authorInfo.length > 1 &&
					index === authorInfo.length - 2 &&
					_x( ' and ', 'post author', 'full-site-editing' ),
			];
		}, [] ) }
	</span>
);
