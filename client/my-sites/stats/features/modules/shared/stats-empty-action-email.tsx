import config from '@automattic/calypso-config';
import { mail } from '@automattic/components/src/icons';
import { localizeUrl } from '@automattic/i18n-utils';
import { useTranslate } from 'i18n-calypso';
import React from 'react';
import { useSelector } from 'react-redux';
import EmptyStateAction from 'calypso/my-sites/stats/components/empty-state-action';
import {
	JETPACK_SUPPORT_NEWSLETTER_URL,
	JETPACK_NEWSLETTER_LANDING_PAGE_URL,
	SUBSCRIBERS_NEWSLETTER_LANDING_PAGE_URL,
} from 'calypso/my-sites/stats/const';
import isAtomicSite from 'calypso/state/selectors/is-site-wpcom-atomic';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import type { StatsEmptyActionProps } from './';

const StatsEmptyActionEmail: React.FC< StatsEmptyActionProps > = ( { from } ) => {
	const translate = useTranslate();
	const isOdysseyStats = config.isEnabled( 'is_running_in_jetpack_site' );
	const siteId = useSelector( getSelectedSiteId );
	const isAtomic = useSelector( ( state ) => isAtomicSite( state as any, siteId ) );
	const isJetpack = useSelector( ( state ) => isJetpackSite( state as any, siteId ) );
	const useJetpackLinks = isAtomic || isJetpack;

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

				// If the site is a Jetpack or Atomic site, use the Jetpack links.
				// Otherwise, use the WordPress.com links.
				let redirectUrl = localizeUrl( SUBSCRIBERS_NEWSLETTER_LANDING_PAGE_URL );
				if ( useJetpackLinks ) {
					if ( isOdysseyStats ) {
						redirectUrl = localizeUrl( JETPACK_SUPPORT_NEWSLETTER_URL );
					} else {
						redirectUrl = localizeUrl( JETPACK_NEWSLETTER_LANDING_PAGE_URL );
					}
				}

				setTimeout( () => ( window.location.href = redirectUrl ), 250 );
			} }
		/>
	);
};

export default StatsEmptyActionEmail;
