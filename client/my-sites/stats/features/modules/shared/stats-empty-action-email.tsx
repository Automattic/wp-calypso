import config from '@automattic/calypso-config';
import { mail } from '@automattic/components/src/icons';
import { localizeUrl } from '@automattic/i18n-utils';
import { useTranslate } from 'i18n-calypso';
import React from 'react';
import EmptyStateAction from 'calypso/my-sites/stats/components/empty-state-action';
import {
	JETPACK_SUPPORT_NEWSLETTER_URL,
	JETPACK_NEWSLETTER_LANDING_PAGE_URL,
} from 'calypso/my-sites/stats/const';
import type { StatsEmptyActionProps } from './';

const StatsEmptyActionEmail: React.FC< StatsEmptyActionProps > = ( { from } ) => {
	const translate = useTranslate();
	const isOdysseyStats = config.isEnabled( 'is_running_in_jetpack_site' );

	return (
		<EmptyStateAction
			icon={ mail }
			text={ translate( 'Send emails with Newsletter' ) }
			analyticsDetails={ {
				from: from,
				feature: 'newsletter',
			} }
			onClick={ () => {
				// analytics event tracting handled in EmptyStateAction component

				const redirectUrl = isOdysseyStats
					? localizeUrl( JETPACK_SUPPORT_NEWSLETTER_URL )
					: localizeUrl( JETPACK_NEWSLETTER_LANDING_PAGE_URL );

				setTimeout( () => ( window.location.href = redirectUrl ), 250 );
			} }
		/>
	);
};

export default StatsEmptyActionEmail;
