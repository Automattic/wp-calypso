/**
 * External dependencies
 */
import React from 'react';
import { startsWith } from 'lodash';

/**
 * Internal dependencies
 */
import Gravatar from 'components/gravatar';
import SiteIcon from 'blocks/site-icon';
import { localize } from 'i18n-calypso';
import classnames from 'classnames';

const ReaderAvatar = ( { author, siteIcon, feedIcon, siteUrl, siteIconSize = 96, preferGravatar = false, showPlaceholder = false } ) => {
	let fakeSite;
	if ( siteIcon ) {
		fakeSite = {
			icon: {
				img: siteIcon
			}
		};
	} else if ( feedIcon ) {
		fakeSite = {
			icon: {
				img: feedIcon
			}
		};
	}

	let hasSiteIcon = !! ( fakeSite && fakeSite.icon );
	let hasAvatar = !! ( author && author.has_avatar );

	if ( hasSiteIcon && hasAvatar ) {
		// Do these both reference the same image? Disregard query string params.
		const [ withoutQuery, ] = fakeSite.icon.img.split( '?' );
		if ( startsWith( author.avatar_URL, withoutQuery ) ) {
			hasAvatar = false;
		}
	}

	// If we have an avatar and we prefer it, don't even consider the site icon
	if ( hasAvatar && preferGravatar ) {
		hasSiteIcon = false;
	}

	const hasBothIcons = hasSiteIcon && hasAvatar;

	const classes = classnames(
		'reader-avatar',
		{
			'has-site-and-author-icon': hasBothIcons,
			'has-site-icon': hasSiteIcon,
			'has-gravatar': hasAvatar || showPlaceholder
		}
	);

	const siteIconElement = hasSiteIcon && <SiteIcon key="site-icon" size={ siteIconSize } site={ fakeSite } />;
	const avatarElement = ( hasAvatar || showPlaceholder ) && <Gravatar key="author-avatar" user={ author } size={ hasBothIcons ? 32 : 96 } />;
	const iconElements = [ siteIconElement, avatarElement ];

	return (
		<div className={ classes }>
			{ siteUrl ? <a href={ siteUrl }>{ iconElements }</a> : iconElements }
		</div>
	);
};

ReaderAvatar.propTypes = {
	author: React.PropTypes.object,
	siteIcon: React.PropTypes.string,
	feedIcon: React.PropTypes.string,
	siteUrl: React.PropTypes.string,
	preferGravatar: React.PropTypes.bool,
	showPlaceholder: React.PropTypes.bool
};

export default localize( ReaderAvatar );
