import config from '@automattic/calypso-config';
import { mail } from '@automattic/components/src/icons';
import { localizeUrl } from '@automattic/i18n-utils';
import { useTranslate } from 'i18n-calypso';
import React from 'react';
import { useSelector } from 'react-redux';
import EmptyStateAction from 'calypso/my-sites/stats/components/empty-state-action';
import { JETPACK_SUPPORT_NEWSLETTER_URL } from 'calypso/my-sites/stats/const';
import { isJetpackSite, getSiteSlug } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import type { StatsEmptyActionProps } from './';

const StatsEmptyActionEmail: React.FC< StatsEmptyActionProps > = ( { from } ) => {
	const translate = useTranslate();
	const isOdysseyStats = config.isEnabled( 'is_running_in_jetpack_site' );
	const siteId = useSelector( getSelectedSiteId );
	const siteSlug = useSelector( ( state ) => getSiteSlug( state, siteId ) );
	const isJetpack = useSelector( ( state ) =>
		isJetpackSite( state, siteId, { treatAtomicAsJetpackSite: false } )
	);

	return (
		<EmptyStateAction
			icon={ mail }
			text={ translate( 'Set up your newsletter' ) }
			analyticsDetails={ {
				from: from,
				feature: 'newsletter',
			} }
			onClick={ () => {
				if ( isJetpack || isOdysseyStats || ! siteSlug ) {
					const supportLink = localizeUrl( JETPACK_SUPPORT_NEWSLETTER_URL );
					setTimeout( () => window.open( supportLink, '_blank' ), 250 );
				} else {
					setTimeout( () => ( window.location.href = `/settings/newsletter/${ siteSlug }` ), 250 );
				}
			} }
		/>
	);
};

export default StatsEmptyActionEmail;
