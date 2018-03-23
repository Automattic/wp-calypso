/** @format */

/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';

const NotEnoughData = ( { translate } ) => (
	<div className="not-enough-data">
		<img src="/calypso/images/google-my-business/not-enough-data.svg" />
		<br />
		{ translate( "We don't have enough data" ) }
	</div>
);

export default localize( NotEnoughData );
