/** @format */
/**
 * External dependencies
 */
import React from 'react';

export const FormattedBlock = ( { content = {} } ) => {
	const { siteId, children, commentId, name, postId, text = null, type } = content;

	if ( 'string' === typeof content ) {
		return content;
	}

	if ( undefined === type && ! children ) {
		return text;
	}

	const descent = children.map( ( child, key ) => (
		<FormattedBlock key={ key } content={ child } />
	) );

	switch ( type ) {
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

		case 'person':
			return (
				<a href={ `/people/edit/${ siteId }/${ name }` }>
					<strong>{ descent }</strong>
				</a>
			);

		case 'plugin':
			return <a href={ `/plugins/${ name }/${ siteId }` }>{ descent }</a>;

		case 'post':
			return (
				<a href={ `/read/blogs/${ siteId }/posts/${ postId }` }>
					<em>{ descent }</em>
				</a>
			);

		case 'theme':
			return (
				<a href={ content.url } target="_blank" rel="noopener noreferrer">
					<strong>
						<em>{ descent }</em>
					</strong>
				</a>
			);

		default:
			return descent;
	}
};

export default FormattedBlock;
