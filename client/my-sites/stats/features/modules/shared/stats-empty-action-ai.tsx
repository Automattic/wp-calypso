import { sparkles } from '@automattic/components/src/icons';
import { localizeUrl } from '@automattic/i18n-utils';
import { useTranslate } from 'i18n-calypso';
import React from 'react';
import EmptyStateAction from 'calypso/my-sites/stats/components/empty-state-action';
import { JETPACK_SUPPORT_AI_URL } from 'calypso/my-sites/stats/const';
import { useSelector } from 'calypso/state';
import { getSiteAdminUrl, isJetpackSite } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import type { StatsEmptyActionProps } from './';

const StatsEmptyActionAI: React.FC< StatsEmptyActionProps > = ( { from } ) => {
	const translate = useTranslate();
	const siteId = useSelector( getSelectedSiteId );
	const isJetpack = useSelector( ( state ) => isJetpackSite( state, siteId ) );
	const siteAdminUrl = useSelector( ( state ) => getSiteAdminUrl( state, siteId ) );

	return (
		<EmptyStateAction
			icon={ sparkles }
			text={ translate( 'Craft engaging content with Jetpack AI assistant' ) }
			analyticsDetails={ {
				from: from,
				feature: 'ai_assistant',
			} }
			onClick={ () => {
				// analytics event tracting handled in EmptyStateAction component

				const redirectUrl = isJetpack
					? `${ siteAdminUrl }admin.php?page=my-jetpack#/jetpack-ai` // For Jetpack go to the plugin page.
					: localizeUrl( JETPACK_SUPPORT_AI_URL );

				setTimeout( () => ( window.location.href = redirectUrl ), 250 );
			} }
		/>
	);
};

export default StatsEmptyActionAI;
