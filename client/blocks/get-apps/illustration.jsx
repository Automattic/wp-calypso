/**
 * External dependencies
 */

import React from 'react';
import { localize } from 'i18n-calypso';

const GetAppsIllustration = ( { translate } ) => (
	<div className="get-apps__illustration">
		<img
			src={ '/calypso/images/illustrations/get-apps-banner.svg' }
			alt={ translate( 'Groups of people looking at WordPress mobile apps.' ) }
		/>
		<h2 className="get-apps__illustration-heading">
			{ translate( 'Inspiration strikes any time, anywhere.' ) }
		</h2>
		<p className="get-apps__illustration-tagline">
			{ translate( 'Get WordPress apps for all your screens.' ) }
		</p>
	</div>
);

export default localize( GetAppsIllustration );
