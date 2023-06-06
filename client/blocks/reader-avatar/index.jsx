import { safeImageUrl } from '@automattic/calypso-url';
import { Gridicon } from '@automattic/components';
import classnames from 'classnames';
import { localize } from 'i18n-calypso';
import { startsWith, get } from 'lodash';
import PropTypes from 'prop-types';
import SiteIcon from 'calypso/blocks/site-icon';
import Gravatar from 'calypso/components/gravatar';

import './style.scss';

const noop = () => {};

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
	iconSize = null,
} ) => {
	let fakeSite;

	// don't show the default favicon for some sites
	if ( feedIcon?.endsWith( 'wp.com/i/buttonw-com.png' ) ) {
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

	let siteIconSize;
	let gravatarSize;
	if ( isCompact ) {
		siteIconSize = 40;
		gravatarSize = hasBothIcons ? 32 : 40;
	} else {
		siteIconSize = 96;
		gravatarSize = hasBothIcons ? 32 : 96;
	}

	if ( iconSize > 0 ) {
		siteIconSize = iconSize;
		gravatarSize = iconSize;
	}

	const classes = classnames( 'reader-avatar', {
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
};

ReaderAvatar.propTypes = {
	author: PropTypes.object,
	siteIcon: PropTypes.string,
	feedIcon: PropTypes.string,
	siteUrl: PropTypes.string,
	preferGravatar: PropTypes.bool,
	showPlaceholder: PropTypes.bool,
	isCompact: PropTypes.bool,
	onClick: PropTypes.func,
	iconSize: PropTypes.number,
};

ReaderAvatar.defaultProps = {
	onClick: noop,
};

export default localize( ReaderAvatar );
