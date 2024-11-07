import { localize } from 'i18n-calypso';
import { Fragment } from 'react';

const GooglePhotosMigration = ( { translate } ) => (
	<Fragment>
		<h3>{ translate( 'Your Google Photos connection is being upgraded!' ) }</h3>
		<p>
			{ translate(
				'We are moving to a new Google Photos Picker service. You will need to disconnect and reconnect to continue accessing your photos.'
			) }
		</p>
	</Fragment>
);

export default localize( GooglePhotosMigration );
