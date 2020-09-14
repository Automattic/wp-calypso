/**
 * External dependencies
 */
import React from 'react';
import { startsWith } from 'lodash';

const blocksByType = {};
export function getBlockByType( type ) {
	return blocksByType[ type ];
}

function assignBlockType( type, block ) {
	blocksByType[ type ] = block;
}

export const Strong = ( { children } ) => <strong>{ children }</strong>;
assignBlockType( 'b', Strong );

export const Emphasis = ( { children } ) => <em>{ children }</em>;
assignBlockType( 'i', Emphasis );

export const Preformatted = ( { children } ) => <pre>{ children }</pre>;
assignBlockType( 'pre', Preformatted );

export const Link = ( { content, onClick, children } ) => {
	const { activity, section, intent } = content;

	const url = startsWith( content.url, 'https://wordpress.com/' )
		? content.url.substr( 21 )
		: content.url;
	return (
		<a
			href={ url }
			onClick={ onClick }
			data-activity={ activity }
			data-section={ section }
			data-intent={ intent }
		>
			{ children }
		</a>
	);
};
assignBlockType( 'a', Link );
assignBlockType( 'link', Link );

export const FilePath = ( { children } ) => (
	<div>
		<code>{ children }</code>
	</div>
);
assignBlockType( 'filepath', FilePath );

export const Post = ( { content, children } ) => {
	if ( content.isTrashed ) {
		return <a href={ `/posts/${ content.siteId }/trash` }>{ children }</a>;
	}

	return (
		<a href={ `/read/blogs/${ content.siteId }/posts/${ content.postId }` }>
			<em>{ children }</em>
		</a>
	);
};
assignBlockType( 'post', Post );

export const Comment = ( { content, children } ) => (
	<a
		href={ `/read/blogs/${ content.siteId }/posts/${ content.postId }#comment-${ content.commentId }` }
	>
		{ children }
	</a>
);
assignBlockType( 'comment', Comment );

export const Person = ( { content, onClick, meta, children } ) => (
	<a
		href={ `/people/edit/${ content.siteId }/${ content.name }` }
		onClick={ onClick }
		data-activity={ meta.activity }
		data-section="users"
		data-intent="edit"
	>
		<strong>{ children }</strong>
	</a>
);
assignBlockType( 'person', Person );

export const Plugin = ( { content, onClick, meta, children } ) => (
	<a
		href={ `/plugins/${ content.pluginSlug }/${ content.siteSlug }` }
		onClick={ onClick }
		data-activity={ meta.activity }
		data-section="plugins"
		data-intent="view"
	>
		{ children }
	</a>
);
assignBlockType( 'plugin', Plugin );

export const Theme = ( { content, onClick, meta, children } ) => {
	const { themeUri, themeSlug, siteSlug } = content;
	if ( ! themeUri ) {
		return children;
	}

	if ( /wordpress\.com/.test( themeUri ) ) {
		return (
			<a
				href={ `/theme/${ themeSlug }/${ siteSlug }` }
				onClick={ onClick }
				data-activity={ meta.activity }
				data-section="themes"
				data-intent="view"
			>
				{ children }
			</a>
		);
	}

	return (
		<a
			href={ themeUri }
			target="_blank"
			rel="noopener noreferrer"
			onClick={ onClick }
			data-activity={ meta.activity }
			data-section="themes"
			data-intent="view"
		>
			{ children }
		</a>
	);
};
assignBlockType( 'theme', Theme );
