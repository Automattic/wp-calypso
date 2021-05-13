/**
 * External dependencies
 */
import React, { Fragment } from 'react';
import { localize } from 'i18n-calypso';

const PicasaMigration = ( { translate } ) => (
	<Fragment>
		<h3>{ translate( 'Your Google Photos connection is being upgraded!' ) }</h3>
		<p>
			{ translate(
				'We are moving to a new and faster Google Photos service. You will need to disconnect and reconnect to continue accessing your photos.'
			) }
		</p>
	</Fragment>
);

export default localize( PicasaMigration );
