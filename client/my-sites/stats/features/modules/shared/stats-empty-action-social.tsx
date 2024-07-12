import config from '@automattic/calypso-config';
import { localizeUrl } from '@automattic/i18n-utils';
import { megaphone } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import React from 'react';
import EmptyStateAction from 'calypso/my-sites/stats/components/empty-state-action';
import {
	JETPACK_SUPPORT_SOCIAL_URL,
	JETPACK_SOCIAL_LANDING_PAGE_URL,
} from 'calypso/my-sites/stats/const';
import type { StatsEmptyActionProps } from './';

const StatsEmptyActionSocial: React.FC< StatsEmptyActionProps > = ( { from } ) => {
	const translate = useTranslate();
	const isOdysseyStats = config.isEnabled( 'is_running_in_jetpack_site' );

	return (
		<EmptyStateAction
			icon={ megaphone }
			text={ translate( 'Share on social media with one click' ) }
			analyticsDetails={ {
				from: from,
				feature: 'social_sharing',
			} }
			onClick={ () => {
				// analytics event tracting handled in EmptyStateAction component

				const redirectUrl = isOdysseyStats
					? localizeUrl( JETPACK_SUPPORT_SOCIAL_URL )
					: localizeUrl( JETPACK_SOCIAL_LANDING_PAGE_URL );

				setTimeout( () => ( window.location.href = redirectUrl ), 250 );
			} }
		/>
	);
};

export default StatsEmptyActionSocial;
