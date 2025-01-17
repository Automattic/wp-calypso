import { safeImageUrl } from '@automattic/calypso-url';
import { Gridicon } from '@automattic/components';
import clsx from 'clsx';
import SiteIcon from 'calypso/blocks/site-icon';
import Gravatar from 'calypso/components/gravatar';
import {
	getUserProfileUrl,
	isUserProfileEnabled,
} from 'calypso/reader/user-stream/user-profile.utils';

import './style.scss';

const noop = () => undefined;

export type ReaderAvatarAuthor = {
	ID?: number;
	avatar_URL?: string;
	has_avatar?: boolean;
	display_name?: string;
	name?: string;
};

type ReaderAvatarProps = {
	author?: ReaderAvatarAuthor | null; // An author object to pull the author info from.
	siteIcon?: string; // URL to the site icon image.
	feedIcon?: string; // URL to the feed icon image.
	siteUrl?: string; // If present, the avatar will be linked to this URL.
	preferGravatar?: boolean; // If we have an avatar and we prefer it, don't even consider the site icon.
	preferBlavatar?: boolean;
	showPlaceholder?: boolean; // Show a loading placeholder if the icons/author are not yet available.
	isCompact?: boolean; // Show a small version of the avatar. Used in post cards and streams.
	onClick?: () => void; // Click handler to be executed when avatar is clicked.
	iconSize?: number | null;
};

/**
 * Display an avatar for a feed, site and/or author.
 *
 * If both a feed/site icon and author Gravatar are available, they will be overlaid on top of each other.
 */
export default function ReaderAvatar( {
	author,
	siteIcon,
	feedIcon,
	siteUrl,
	isCompact = false,
	preferGravatar = false,
	preferBlavatar = false,
	showPlaceholder = false,
	onClick = noop,
	iconSize = null,
}: ReaderAvatarProps ) {
	let fakeSite;

	const safeSiteIcon = safeImageUrl( siteIcon );
	const safeFeedIcon = safeImageUrl(
		// don't show the default favicon for some sites
		feedIcon?.endsWith( 'wp.com/i/buttonw-com.png' ) ? null : feedIcon
	);

	if ( safeSiteIcon ) {
		fakeSite = {
			icon: {
				img: safeSiteIcon,
			},
		};
	} else if ( safeFeedIcon ) {
		fakeSite = {
			icon: {
				img: safeFeedIcon,
			},
		};
	}

	let hasSiteIcon = !! fakeSite?.icon?.img;
	let hasAvatar = !! author?.has_avatar;

	if ( fakeSite?.icon?.img && hasAvatar && typeof author?.avatar_URL === 'string' ) {
		// Do these both reference the same image? Disregard query string params.
		const [ withoutQuery ] = fakeSite.icon.img.split( '?' );
		if ( author.avatar_URL.startsWith( withoutQuery ) ) {
			hasAvatar = false;
		}
	}

	// If we have an avatar and we prefer it, don't even consider the site icon
	if ( hasAvatar && preferGravatar ) {
		hasSiteIcon = false;
	} else if ( preferBlavatar ) {
		hasAvatar = false;
		showPlaceholder = false;
	}

	const hasBothIcons = hasSiteIcon && hasAvatar;

	let siteIconSize;
	let gravatarSize;
	if ( isCompact ) {
		siteIconSize = 40;
		gravatarSize = hasBothIcons ? 32 : 40;
	} else {
		siteIconSize = 96;
		gravatarSize = hasBothIcons ? 32 : 96;
	}

	if ( typeof iconSize === 'number' && iconSize > 0 ) {
		siteIconSize = iconSize;
		gravatarSize = iconSize;
	}

	const classes = clsx( 'reader-avatar', {
		'is-compact': isCompact,
		'has-site-and-author-icon': hasBothIcons,
		'has-site-icon': hasSiteIcon,
		'has-gravatar': hasAvatar || showPlaceholder,
	} );
	const defaultIconElement = ! hasSiteIcon && ! hasAvatar && ! showPlaceholder && (
		<Gridicon key="globe-icon" icon="globe" size={ siteIconSize } />
	);
	const siteIconElement = hasSiteIcon && (
		<SiteIcon key="site-icon" size={ siteIconSize } site={ fakeSite } />
	);
	const avatarUrl = isUserProfileEnabled() && author?.ID ? getUserProfileUrl( author.ID ) : null;
	const authorAvatar = ( hasAvatar || showPlaceholder ) && (
		<Gravatar key="author-avatar" user={ author } size={ gravatarSize } />
	);
	const avatarElement = avatarUrl ? <a href={ avatarUrl }> { authorAvatar }</a> : authorAvatar;
	const iconElements = [ defaultIconElement, siteIconElement, avatarElement ];

	return (
		<div className={ classes } onClick={ onClick } aria-hidden="true">
			{ siteUrl ? <a href={ siteUrl }>{ iconElements }</a> : iconElements }
		</div>
	);
}
