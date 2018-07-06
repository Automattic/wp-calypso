/** @format */

/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import ExternalLink from 'components/external-link';
import { getSupportSiteLocale } from 'lib/i18n-utils';

function PodcastingSupportLink( { translate } ) {
	const supportLink =
		'https://' + getSupportSiteLocale() + '.support.wordpress.com/audio/podcasting/';

	return (
		<ExternalLink
			href={ supportLink }
			target="_blank"
			icon
			iconSize={ 14 }
			className="podcasting-details__support-link"
		>
			{ translate( 'Learn more' ) }
		</ExternalLink>
	);
}

export default localize( PodcastingSupportLink );
