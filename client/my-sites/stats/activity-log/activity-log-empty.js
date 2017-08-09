/** @format */
/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';

function ActivityLogEmpty( { translate } ) {
	return (
		<div>
			{ translate( 'No activity for this period' ) }
		</div>
	);
}

export default localize( ActivityLogEmpty );
