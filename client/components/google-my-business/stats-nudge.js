/** @format */

/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal Dependencies
 */
import Card from 'components/card';
import Button from 'components/button';

export const StatsNudge = ( { translate } ) => {
	return (
		<Card className="google-my-business__stats-nudge">
			<h2 className="google-my-business__stats-nudge-heading">
				{ translate( 'Is your business listed on Google?' ) }
			</h2>

			<p className="google-my-business__stats-nudge-description">
				{ translate( 'Google my business etc.' ) }
			</p>

			<Button className="google-my-business__stats-nudge-button">
				{ translate( 'Drive More Traffic' ) }
			</Button>
			<Button className="google-my-business__stats-nudge-button">{ translate( 'Not Now' ) }</Button>
		</Card>
	);
};

export default localize( StatsNudge );
