import { mail } from '@automattic/components/src/icons';
import { localizeUrl } from '@automattic/i18n-utils';
import { useTranslate } from 'i18n-calypso';
import React from 'react';
import { useSelector } from 'react-redux';
import useSupportDocData from 'calypso/components/inline-support-link/use-support-doc-data';
import EmptyStateAction from 'calypso/my-sites/stats/components/empty-state-action';
import {
	JETPACK_SUPPORT_NEWSLETTER_URL,
	NEWSLETTER_SUPPORT_URL,
} from 'calypso/my-sites/stats/const';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import type { StatsEmptyActionProps } from './';

const StatsEmptyActionEmail: React.FC< StatsEmptyActionProps > = ( { from } ) => {
	const translate = useTranslate();
	const siteId = useSelector( getSelectedSiteId );
	const isJetpack = useSelector( ( state ) => isJetpackSite( state as any, siteId ) );

	const { openSupportDoc } = useSupportDocData( {
		supportLink: localizeUrl( isJetpack ? JETPACK_SUPPORT_NEWSLETTER_URL : NEWSLETTER_SUPPORT_URL ),
	} );

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

				// If the site is a Jetpack site, use the Jetpack links.
				// Otherwise, use the WordPress.com links.
				openSupportDoc();
			} }
		/>
	);
};

export default StatsEmptyActionEmail;
