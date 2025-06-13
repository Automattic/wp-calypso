import { mail } from '@automattic/components/src/icons';
import { HelpCenter } from '@automattic/data-stores';
import { useDispatch as useDataStoreDispatch } from '@wordpress/data';
import { useTranslate } from 'i18n-calypso';
import React from 'react';
import { useSelector } from 'react-redux';
import EmptyStateAction from 'calypso/my-sites/stats/components/empty-state-action';
import {
	JETPACK_SUPPORT_NEWSLETTER_URL,
	NEWSLETTER_SUPPORT_URL,
} from 'calypso/my-sites/stats/const';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import type { StatsEmptyActionProps } from './';

const HELP_CENTER_STORE = HelpCenter.register();

const StatsEmptyActionEmail: React.FC< StatsEmptyActionProps > = ( { from } ) => {
	const translate = useTranslate();
	const siteId = useSelector( getSelectedSiteId );
	const isJetpack = useSelector( ( state ) => isJetpackSite( state as any, siteId ) );

	const { setShowSupportDoc } = useDataStoreDispatch( HELP_CENTER_STORE );

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
				const redirectUrl = isJetpack ? JETPACK_SUPPORT_NEWSLETTER_URL : NEWSLETTER_SUPPORT_URL;

				setShowSupportDoc( redirectUrl );
			} }
		/>
	);
};

export default StatsEmptyActionEmail;
