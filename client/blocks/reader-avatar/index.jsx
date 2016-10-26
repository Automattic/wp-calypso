/**
 * External dependencies
 */
import React from 'react';
import { startsWith } from 'lodash';

/**
 * Internal dependencies
 */
import Gravatar from 'components/gravatar';
import SiteIcon from 'components/site-icon';
import { localize } from 'i18n-calypso';
import classnames from 'classnames';

const ReaderAvatar = ( { author, siteIcon, feedIcon, preferGravatar = false } ) => {
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

	let hasSiteIcon = !! siteIcon;
	let hasAvatar = !! ( author && author.has_avatar );

	if ( hasSiteIcon && hasAvatar ) {
		// do these both reference the same image? disregard querystring params.
		const [ withoutQuery, ] = siteIcon.split( '?' );
		if ( startsWith( author.avatar_URL, withoutQuery ) ) {
			hasAvatar = false;
		}
	}

	// if we have an avatar and we prefer it, don't even consider the site icon
	if ( hasAvatar && preferGravatar ) {
		hasSiteIcon = false;
	}

	const hasBothIcons = hasSiteIcon && hasAvatar;

	const classes = classnames(
		'reader-avatar',
		{
			'has-site-and-author-icon': hasBothIcons,
			'has-site-icon': hasSiteIcon,
			'has-gravatar': hasAvatar
		}
	);

	return (
		<div className={ classes }>
			{ hasSiteIcon && <SiteIcon size={ 96 } site={ fakeSite } /> }
			{ hasAvatar && <Gravatar user={ author } size={ hasBothIcons ? 32 : 96 } /> }
		</div>
	);
};

export default localize( ReaderAvatar );
