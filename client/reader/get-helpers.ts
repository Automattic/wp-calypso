import { getUrlParts } from '@automattic/calypso-url';
import { translate } from 'i18n-calypso';
import { trim } from 'lodash';
import { ReactNode } from 'react';
import { decodeEntities, stripHTML } from 'calypso/lib/formatting';
import { formatUrlForDisplay } from 'calypso/reader/lib/feed-display-helper';
import { isSiteDescriptionBlocked } from 'calypso/reader/lib/site-description-blocklist';

export interface ReaderSite {
	description: string;
	domain: string;
	feed_URL: string;
	is_error: boolean;
	name: string;
	title: string;
	owner?: {
		name: string;
		first_name: string;
		last_name: string;
	};
	subscribers_count: number;
	URL?: string;
}

export interface ReaderPost {
	attachments?: { [ key: number ]: { alt: string } };
	author?: {
		avatar_URL: string;
	};
	feed_URL: string;
	is_seen: boolean;
	post_thumbnail?: {
		ID: number;
	};
	site_icon?: { img: string } | string;
	site_name: string;
	site_URL: string;
	title: string;
}

export interface ReaderFeed {
	description: string;
	feed_URL: string;
	is_error: boolean;
	name: string;
	title: string;
	URL?: string;
	subscribers_count: number;
}

interface GetSiteUrlArgs {
	feed?: Partial< ReaderFeed >;
	site?: Partial< ReaderSite >;
	post?: Partial< ReaderPost >;
}

/**
 * Given a feed, site, or post: return the site url. return false if one could not be found.
 */
export const getSiteUrl = ( { feed, site, post }: GetSiteUrlArgs = {} ): string | undefined => {
	const siteUrl = !! site && ( site.URL || site.domain );
	const feedUrl = !! feed && ( feed.URL || feed.feed_URL );
	const postUrl = !! post && post.site_URL;

	if ( ! siteUrl && ! feedUrl && ! postUrl ) {
		return undefined;
	}

	return siteUrl || feedUrl || postUrl || undefined;
};

interface GetFeedUrlArgs {
	feed?: Partial< ReaderFeed >;
	site?: Partial< ReaderSite >;
	post?: Partial< ReaderPost >;
}

/**
 * Given a feed, site, or post: return the feed url. return false if one could not be found.
 * The feed url is different from the site url in that it is unique per feed. A single siteUrl may
 * be home to many feeds
 */
export const getFeedUrl = ( { feed, site, post }: GetFeedUrlArgs = {} ) => {
	const siteUrl = !! site && site.feed_URL;
	const feedUrl = !! feed && ( feed.feed_URL || feed.URL );
	const postUrl = !! post && post.feed_URL;

	return siteUrl || feedUrl || postUrl;
};

/**
 * Given a feed, site, or post: return the site icon. return false if one could not be found.
 */
export function getPostIcon( post: Partial< ReaderPost > ): string | undefined {
	if ( typeof post?.site_icon === 'object' && post?.site_icon?.img ) {
		return post.site_icon.img;
	}

	if ( typeof post?.site_icon === 'string' ) {
		return post.site_icon;
	}

	return post?.author?.avatar_URL;
}

interface GetSiteDomainArgs {
	feed?: Partial< ReaderFeed >;
	site?: Partial< ReaderSite >;
}

/**
 * getSiteDomain function extracts the domain of a website from the provided `site` and `feed` objects.
 * It returns the domain of the site if available, otherwise, it extracts the domain from the site URL.
 * @returns {string} - The domain of the site. If the `site` object has a `domain` property that is a string,
 *                      it returns that. Otherwise, it gets the URL of the site from the `feed` and `site` objects,
 *                      extracts the hostname from the URL, and returns it. If the hostname is an empty string,
 *                      it returns the site URL. If the hostname starts with "www.", it removes the "www." and returns the rest.
 */
export const getSiteDomain = ( { feed, site }: GetSiteDomainArgs = {} ): string | undefined => {
	if ( typeof site?.domain === 'string' ) {
		return site.domain;
	}

	const siteUrl = getSiteUrl( { feed, site } ) ?? '';
	const hostname = getUrlParts( siteUrl ).hostname;
	return formatUrlForDisplay( hostname === '' ? siteUrl : hostname );
};

interface GetSiteNameArgs {
	feed?: Partial< ReaderFeed >;
	post?: Partial< ReaderPost >;
	site?: Partial< ReaderSite >;
}

/**
 * Given a feed, site, or post: output the best title to use for the owning site.
 */
export const getSiteName = ( { feed, site, post }: GetSiteNameArgs = {} ): string | null => {
	let siteName: string | null | undefined = null;
	const isDefaultSiteTitle =
		( site && site.name === translate( 'Site Title' ) ) ||
		( feed && feed.name === translate( 'Site Title' ) );

	if ( ! isDefaultSiteTitle && site && site.title ) {
		siteName = site.title;
	} else if ( ! isDefaultSiteTitle && feed && ( feed.name || feed.title ) ) {
		siteName = feed.name || feed.title;
	} else if ( ! isDefaultSiteTitle && post && post.site_name ) {
		siteName = post.site_name;
	} else if ( site && site.is_error && feed && feed.is_error && ! post ) {
		siteName = translate( 'Error fetching feed' );
	} else if ( site && site.domain ) {
		siteName = site.domain;
	} else {
		const siteUrl = getSiteUrl( { feed, site, post } );
		siteName = siteUrl ? getUrlParts( siteUrl ).hostname : null;
	}

	if ( ! siteName ) {
		return null;
	}

	return decodeEntities( siteName );
};

interface GetSiteDescriptionArgs {
	feed?: Partial< ReaderFeed >;
	site?: Partial< ReaderSite >;
}

export const getSiteDescription = ( { site, feed }: GetSiteDescriptionArgs ): string | null => {
	const description = ( site && site.description ) || ( feed && feed.description ) || '';
	if ( isSiteDescriptionBlocked( description ) ) {
		return null;
	}
	return description ? stripHTML( description ) : description;
};

export const getSiteAuthorName = ( site: ReaderSite ): string => {
	const siteAuthor = site && site.owner;
	const authorFullName =
		siteAuthor &&
		( siteAuthor.name ||
			trim( `${ siteAuthor.first_name || '' } ${ siteAuthor.last_name || '' }` ) );

	return decodeEntities( authorFullName || '' );
};

interface isEligibleForUnseenArgs {
	isWPForTeamsItem: boolean;
	currentRoute: string | null;
	hasOrganization: boolean | null;
}

/**
 * Check if route or feed/blog is eligible to use seen posts feature (unseen counts and mark as seen)
 */
export const isEligibleForUnseen = ( {
	isWPForTeamsItem = false,
	currentRoute = null,
	hasOrganization = null,
}: isEligibleForUnseenArgs ): boolean => {
	let isEligible = isWPForTeamsItem;
	if ( hasOrganization !== null ) {
		isEligible = hasOrganization;
	}

	if ( currentRoute ) {
		if (
			[ '/reader/a8c', '/reader/p2' ].includes( currentRoute ) ||
			[ '/reader/feeds/', '/reader/blogs/' ].some( ( route ) => currentRoute.startsWith( route ) )
		) {
			return isEligible;
		}

		return false;
	}

	return isEligible;
};

interface CanBeMarkedAsSeenArgs {
	post: ReaderPost | null;
	posts: ReaderPost[];
}

/**
 * Check if the post/posts can be marked as seen based on the existence of `is_seen` flag and the current route.
 */
export const canBeMarkedAsSeen = ( {
	post = null,
	posts = [],
}: CanBeMarkedAsSeenArgs ): boolean => {
	if ( post !== null ) {
		return post.hasOwnProperty( 'is_seen' );
	}

	if ( posts.length ) {
		for ( const thePost in posts ) {
			if ( thePost.hasOwnProperty( 'is_seen' ) ) {
				return true;
			}
		}
	}

	return false;
};

/**
 * Return Featured image alt text.
 */
export const getFeaturedImageAlt = ( post: ReaderPost ): string | ReactNode => {
	// Each post can have multiple images attached. To make sure we are selecting
	// the alt text of the correct image attachment, we get the ID of the post thumbnail first
	// and then use it to get the alt text of the Featured image.
	const postThumbnailId = post?.post_thumbnail?.ID;
	if ( ! postThumbnailId ) {
		return '';
	}

	const featuredImageAlt = post?.attachments?.[ postThumbnailId ]?.alt;
	const postTitle = post.title;

	// If there is no Featured image alt text available, return post title instead.
	// This will make sure that the featured image has at least some relevant alt text.
	if ( ! featuredImageAlt ) {
		// translators: Adds explanation to the Featured image alt text in Reader
		return translate( '%(postTitle)s - featured image', { args: { postTitle } } );
	}

	return featuredImageAlt;
};

/**
 * Get the follower count from a site/feed.
 */
export const getFollowerCount = ( feed: ReaderFeed, site: ReaderSite ): number | null => {
	if ( site && site.subscribers_count ) {
		return site.subscribers_count;
	}

	if ( feed && feed.subscribers_count > 0 ) {
		return feed.subscribers_count;
	}

	return null;
};
