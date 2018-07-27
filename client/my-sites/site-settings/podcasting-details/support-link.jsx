/** @format */

/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import InlineSupportLink from 'components/inline-support-link';
import { getSupportSiteLocale } from 'lib/i18n-utils';

function PodcastingSupportLink( { showText, iconSize } ) {
	const supportLink =
		'https://' + getSupportSiteLocale() + '.support.wordpress.com/audio/podcasting/';
	const supportPostId = 38147;

	return (
		<InlineSupportLink
			className="podcasting-details__support-link"
			supportPostId={ supportPostId }
			supportLink={ supportLink }
			showText={ showText }
			iconSize={ iconSize }
		/>
	);
}

export default PodcastingSupportLink;
