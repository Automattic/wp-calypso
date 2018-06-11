/** @format */

/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';

function PodcastingNoPermissionsMessage( { translate } ) {
	return (
		<div className="podcasting-details__no-permissions">
			<p>
				{ translate(
					"Oops! You don't have permission to manage Podcasting. " +
						"If you think you should, contact this site's administrator."
				) }
			</p>
		</div>
	);
}

export default localize( PodcastingNoPermissionsMessage );
