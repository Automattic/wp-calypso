/**
 * External dependencies
 */
import React from 'react';
import { startsWith } from 'lodash';

/**
 * Internal dependencies
 */
import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';

export const Strong = ( { children } ) => <strong>{ children }</strong>;

export const Emphasis = ( { children } ) => <em>{ children }</em>;

export const Preformatted = ( { children } ) => <pre>{ children }</pre>;

export const Link = ( { content, onClick, children } ) => {
	const { url: originalUrl, activity, section, intent } = content;

	const isWordPressLink = startsWith( originalUrl, 'https://wordpress.com' );

	// Don't render links to WordPress.com inside Jetpack Cloud
	if ( isWordPressLink && isJetpackCloud() ) {
		return children;
	}

	// On Calypso, relativize links to WordPress.com;
	// for other destinations, render a link with the URL as-is
	const linkUrl = isWordPressLink ? originalUrl.substr( 21 ) : originalUrl;
	return (
		<a
			href={ linkUrl }
			onClick={ onClick }
			data-activity={ activity }
			data-section={ section }
			data-intent={ intent }
		>
			{ children }
		</a>
	);
};

export const FilePath = ( { children } ) => (
	<div>
		<code>{ children }</code>
	</div>
);

export const Post = ( { content, children } ) => {
	// Don't render links to WordPress.com inside Jetpack Cloud
	if ( isJetpackCloud() ) {
		return content.isTrashed ? children : <em>{ children }</em>;
	}

	if ( content.isTrashed ) {
		return <a href={ `/posts/${ content.siteId }/trash` }>{ children }</a>;
	}

	return (
		<a href={ `/read/blogs/${ content.siteId }/posts/${ content.postId }` }>
			<em>{ children }</em>
		</a>
	);
};

export const Comment = ( { content, children } ) => {
	// Don't render links to WordPress.com inside Jetpack Cloud
	if ( isJetpackCloud() ) {
		return children;
	}

	return (
		<a
			href={ `/read/blogs/${ content.siteId }/posts/${ content.postId }#comment-${ content.commentId }` }
		>
			{ children }
		</a>
	);
};

export const Person = ( { content, onClick, meta, children } ) => {
	// Don't render links to WordPress.com inside Jetpack Cloud
	if ( isJetpackCloud() ) {
		return <strong>{ children }</strong>;
	}

	return (
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
};

export const Plugin = ( { content, onClick, meta, children } ) => {
	// Don't render links to WordPress.com inside Jetpack Cloud
	if ( isJetpackCloud() ) {
		return children;
	}

	return (
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
};

export const Theme = ( { content, onClick, meta, children } ) => {
	const { themeUri, themeSlug, siteSlug } = content;
	if ( ! themeUri ) {
		return children;
	}

	if ( /wordpress\.com/.test( themeUri ) ) {
		// Don't render links to WordPress.com inside Jetpack Cloud
		return isJetpackCloud() ? (
			children
		) : (
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
