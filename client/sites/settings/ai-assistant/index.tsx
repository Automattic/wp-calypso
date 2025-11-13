import { queryClient } from '@automattic/api-queries';
import { QueryClientProvider } from '@tanstack/react-query';
import { useTranslate } from 'i18n-calypso';
import QuerySiteSettings from 'calypso/components/data/query-site-settings';
import NavigationHeader from 'calypso/components/navigation-header';
import { Panel } from 'calypso/components/panel';
import { useSelector } from 'calypso/state';
import { getSiteSettings } from 'calypso/state/site-settings/selectors';
import { getSelectedSite, getSelectedSiteId } from 'calypso/state/ui/selectors';
import { AIAssistantForm } from '../../../dashboard/sites/settings-ai-assistant/ai-assistant-form';

export default function AIAssistantSettings() {
	const translate = useTranslate();
	const site = useSelector( getSelectedSite );
	const siteId = useSelector( getSelectedSiteId );
	const settings = useSelector( ( state ) => siteId && getSiteSettings( state, siteId ) );

	if ( ! site || ! settings ) {
		console.log( 'no site or settings' );
		return (
			<Panel className="settings-ai-assistant">
				<NavigationHeader
					title={ translate( 'AI Site Assistant' ) }
					subtitle={ translate( 'Early features for testing and feedback.' ) }
				/>
				{ siteId && <QuerySiteSettings siteId={ siteId } /> }
			</Panel>
		);
	}

	console.log( 'site', site );
	console.log( 'settings', settings );

	return (
		<QueryClientProvider client={ queryClient }>
			<Panel className="settings-ai-assistant">
				<NavigationHeader
					title={ translate( 'AI Site Assistant' ) }
					subtitle={ translate( 'Early features for testing and feedback.' ) }
				/>
				<AIAssistantForm site={ site } settings={ settings } />
			</Panel>
		</QueryClientProvider>
	);
}
