/** @format */
/**
 * External dependencies
 */
import React from 'react';
import { startsWith, endsWith, noop, get } from 'lodash';

/**
 * Internal dependencies
 */
import Gravatar from 'components/gravatar';
import SiteIcon from 'blocks/site-icon';
import { localize } from 'i18n-calypso';
import classnames from 'classnames';
import safeImageUrl from 'lib/safe-image-url';

const ReaderAvatar = ( {
	author,
	siteIcon,
	feedIcon,
	siteUrl,
	isCompact = false,
	preferGravatar = false,
	preferBlavatar = false,
	showPlaceholder = false,
	onClick,
} ) => {
	let fakeSite;

	// don't show the default favicon for some sites
	if ( endsWith( feedIcon, 'wp.com/i/buttonw-com.png' ) ) {
		feedIcon = null;
	}

	const safeSiteIcon = safeImageUrl( siteIcon );
	const safeFeedIcon = safeImageUrl( feedIcon );

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

	let hasSiteIcon = !! get( fakeSite, 'icon.img' );
	let hasAvatar = !! ( author && author.has_avatar );

	if ( hasSiteIcon && hasAvatar ) {
		// Do these both reference the same image? Disregard query string params.
		const [ withoutQuery ] = fakeSite.icon.img.split( '?' );
		if ( startsWith( author.avatar_URL, withoutQuery ) ) {
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

	let siteIconSize, gravatarSize;
	if ( isCompact ) {
		siteIconSize = 32;
		gravatarSize = hasBothIcons ? 24 : 32;
	} else {
		siteIconSize = 96;
		gravatarSize = hasBothIcons ? 32 : 96;
	}

	const classes = classnames( 'reader-avatar', {
		'is-compact': isCompact,
		'has-site-and-author-icon': hasBothIcons,
		'has-site-icon': hasSiteIcon,
		'has-gravatar': hasAvatar || showPlaceholder,
	} );

	const siteIconElement =
		hasSiteIcon && <SiteIcon key="site-icon" size={ siteIconSize } site={ fakeSite } />;
	const avatarElement =
		( hasAvatar || showPlaceholder ) &&
		<Gravatar key="author-avatar" user={ author } size={ gravatarSize } />;
	const iconElements = [ siteIconElement, avatarElement ];

	return (
		<div className={ classes } onClick={ onClick } aria-hidden="true">
			{ siteUrl
				? <a href={ siteUrl }>
						{ iconElements }
					</a>
				: iconElements }
		</div>
	);
};

ReaderAvatar.propTypes = {
	author: React.PropTypes.object,
	siteIcon: React.PropTypes.string,
	feedIcon: React.PropTypes.string,
	siteUrl: React.PropTypes.string,
	preferGravatar: React.PropTypes.bool,
	showPlaceholder: React.PropTypes.bool,
	isCompact: React.PropTypes.bool,
	onClick: React.PropTypes.func,
};

ReaderAvatar.defaultProps = {
	onClick: noop,
};

export default localize( ReaderAvatar );
