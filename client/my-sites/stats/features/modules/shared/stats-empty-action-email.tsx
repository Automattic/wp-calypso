import { mail } from '@automattic/components/src/icons';
import { localizeUrl } from '@automattic/i18n-utils';
import { useTranslate } from 'i18n-calypso';
import React from 'react';
import { useSelector } from 'react-redux';
import EmptyStateAction from 'calypso/my-sites/stats/components/empty-state-action';
import {
	JETPACK_SUPPORT_NEWSLETTER_URL,
	NEWSLETTER_SUPPORT_URL,
} from 'calypso/my-sites/stats/const';
import isAtomicSite from 'calypso/state/selectors/is-site-wpcom-atomic';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import type { StatsEmptyActionProps } from './';

const StatsEmptyActionEmail: React.FC< StatsEmptyActionProps > = ( { from } ) => {
	const translate = useTranslate();
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
				let redirectUrl = localizeUrl( NEWSLETTER_SUPPORT_URL );
				if ( useJetpackLinks ) {
					redirectUrl = localizeUrl( JETPACK_SUPPORT_NEWSLETTER_URL );
				}

				// open in new tab
				setTimeout( () => window.open( redirectUrl, '_blank' ), 250 );
			} }
		/>
	);
};

export default StatsEmptyActionEmail;
