import config from '@automattic/calypso-config';
import { localizeUrl } from '@automattic/i18n-utils';
import { upload } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import React from 'react';
import EmptyStateAction from 'calypso/my-sites/stats/components/empty-state-action';
import {
	JETPACK_SUPPORT_VIDEOPRESS_URL,
	JETPACK_VIDEOPRESS_LANDING_PAGE_URL,
} from 'calypso/my-sites/stats/const';
import type { StatsEmptyActionProps } from './';

const StatsEmptyActionEmail: React.FC< StatsEmptyActionProps > = ( { from } ) => {
	const translate = useTranslate();
	const isOdysseyStats = config.isEnabled( 'is_running_in_jetpack_site' );

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

				const redirectUrl = isOdysseyStats
					? localizeUrl( JETPACK_SUPPORT_VIDEOPRESS_URL )
					: localizeUrl( JETPACK_VIDEOPRESS_LANDING_PAGE_URL );

				setTimeout( () => ( window.location.href = redirectUrl ), 250 );
			} }
		/>
	);
};

export default StatsEmptyActionEmail;
