/** @format */
/**
 * External dependencies
 */
import React from 'react';
import { startsWith } from 'lodash';

export const FormattedBlock = ( { content = {}, onClick = null, meta = {} } ) => {
	const {
		siteId,
		children,
		commentId,
		isTrashed,
		name,
		postId,
		text = null,
		type,
		siteSlug,
		pluginSlug,
		themeSlug,
		themeUri,
	} = content;
	const { activity } = meta;

	if ( 'string' === typeof content ) {
		return content;
	}

	if ( undefined === type && ! children ) {
		return text;
	}

	const descent = children.map( ( child, key ) => (
		<FormattedBlock key={ key } content={ child } onClick={ onClick } />
	) );

	switch ( type ) {
		case 'a':
		case 'link':
			const url = startsWith( content.url, 'https://wordpress.com/' )
				? content.url.substr( 21 )
				: content.url;
			return (
				<a href={ url } onClick={ onClick } data-activity={ activity }>
					{ descent }
				</a>
			);

		case 'b':
			return <strong>{ descent }</strong>;

		case 'comment':
			return (
				<a href={ `/read/blogs/${ siteId }/posts/${ postId }#comment-${ commentId }` }>
					{ descent }
				</a>
			);

		case 'filepath':
			return (
				<div>
					<code>{ descent }</code>
				</div>
			);

		case 'i':
			return <em>{ descent }</em>;

		case 'person':
			return (
				<a href={ `/people/edit/${ siteId }/${ name }` } data-activity={ activity }>
					<strong>{ descent }</strong>
				</a>
			);

		case 'plugin':
			return (
				<a
					href={ `/plugins/${ pluginSlug }/${ siteSlug }` }
					onClick={ onClick }
					data-activity={ activity }
				>
					{ descent }
				</a>
			);

		case 'post':
			return isTrashed ? (
				<a href={ `/posts/${ siteId }/trash` }>{ descent }</a>
			) : (
				<a href={ `/read/blogs/${ siteId }/posts/${ postId }` }>
					<em>{ descent }</em>
				</a>
			);

		case 'pre':
			return <pre>{ descent }</pre>;

		case 'theme':
			if ( ! themeUri ) {
				return descent;
			}

			if ( /wordpress\.com/.test( themeUri ) ) {
				return (
					<a
						href={ `/theme/${ themeSlug }/${ siteSlug }` }
						onClick={ onClick }
						data-activity={ activity }
					>
						{ descent }
					</a>
				);
			}

			return (
				<a
					href={ themeUri }
					target="_blank"
					rel="noopener noreferrer"
					onClick={ onClick }
					data-activity={ activity }
				>
					{ descent }
				</a>
			);

		default:
			return descent;
	}
};

export default FormattedBlock;
