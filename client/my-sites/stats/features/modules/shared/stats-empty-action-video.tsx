import { localizeUrl } from '@automattic/i18n-utils';
import { upload } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import React from 'react';
import EmptyStateAction from '../../../components/empty-state-action';

type StatsEmptyActionEmailProps = {
	from: string;
};

// TODO: move to a shared file if this is the final URL
const JETPACK_SUPPORT_VIDEOPRESS_URL = 'https://jetpack.com/support/videopress';

const StatsEmptyActionEmail: React.FC< StatsEmptyActionEmailProps > = ( { from } ) => {
	const translate = useTranslate();

	return (
		<EmptyStateAction
			icon={ upload }
			text={ translate( 'Upload videos with VideoPress' ) }
			analyticsDetails={ {
				from: from,
				feature: 'videopress',
			} }
			onClick={ () => {
				// analytics event tracting handled in EmptyStateAction component

				setTimeout(
					() => ( window.location.href = localizeUrl( JETPACK_SUPPORT_VIDEOPRESS_URL ) ),
					250
				);
			} }
		/>
	);
};

export default StatsEmptyActionEmail;
