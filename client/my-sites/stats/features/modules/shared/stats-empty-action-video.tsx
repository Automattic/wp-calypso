import config from '@automattic/calypso-config';
import { localizeUrl } from '@automattic/i18n-utils';
import { video } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import React from 'react';
import EmptyStateAction from 'calypso/my-sites/stats/components/empty-state-action';
import {
	JETPACK_SUPPORT_VIDEOPRESS_URL,
	JETPACK_VIDEOPRESS_LANDING_PAGE_URL,
} from 'calypso/my-sites/stats/const';
import { useSelector } from 'calypso/state';
import getIsSiteWPCOM from 'calypso/state/selectors/is-site-wpcom';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import type { StatsEmptyActionProps } from './';

const StatsEmptyActionVideo: React.FC< StatsEmptyActionProps > = ( { from } ) => {
	const translate = useTranslate();
	const isOdysseyStats = config.isEnabled( 'is_running_in_jetpack_site' );
	const siteId = useSelector( getSelectedSiteId ) as number;
	const isWPCOMSite = useSelector( ( state ) => siteId && getIsSiteWPCOM( state, siteId ) );

	if ( isWPCOMSite ) {
		return null;
	}

	return (
		<EmptyStateAction
			icon={ video }
			text={ translate( 'Learn more about VideoPress' ) }
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

export default StatsEmptyActionVideo;
