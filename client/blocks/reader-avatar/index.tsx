import { safeImageUrl } from '@automattic/calypso-url';
import { Gridicon } from '@automattic/components';
import clsx from 'clsx';
import SiteIcon from 'calypso/blocks/site-icon';
import Gravatar from 'calypso/components/gravatar';

import './style.scss';

const noop = () => undefined;

type Author = {
	avatar_URL?: string;
	has_avatar?: boolean;
	display_name?: string;
	name?: string;
};

type ReaderAvatarProps = {
	author?: Author | null;
	siteIcon?: string;
	feedIcon?: string;
	siteUrl?: string;
	preferGravatar?: boolean;
	preferBlavatar?: boolean;
	showPlaceholder?: boolean;
	isCompact?: boolean;
	onClick?: () => void;
	iconSize?: number | null;
};

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
	const avatarElement = ( hasAvatar || showPlaceholder ) && (
		<Gravatar key="author-avatar" user={ author } size={ gravatarSize } />
	);
	const iconElements = [ defaultIconElement, siteIconElement, avatarElement ];

	return (
		<div className={ classes } onClick={ onClick } aria-hidden="true">
			{ siteUrl ? <a href={ siteUrl }>{ iconElements }</a> : iconElements }
		</div>
	);
}
