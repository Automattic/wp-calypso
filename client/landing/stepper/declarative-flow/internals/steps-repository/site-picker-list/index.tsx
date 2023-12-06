import { StepContainer, isSiteAssemblerFlow } from '@automattic/onboarding';
import { select } from '@wordpress/data';
import { useTranslate } from 'i18n-calypso';
import QuerySites from 'calypso/components/data/query-sites';
import FormattedHeader from 'calypso/components/formatted-header';
import SiteSelector from 'calypso/components/site-selector';
import { SITE_STORE } from 'calypso/landing/stepper/stores';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import type { Step } from '../../types';
import type { SiteDetails, SiteSelect } from '@automattic/data-stores';
import type { SiteId } from 'calypso/types';

import './styles.scss';

const SitePicker: Step = function SitePicker( { navigation, flow } ) {
	const translate = useTranslate();
	const { submit, goBack } = navigation;

	const selectSite = ( siteId: SiteId ) => {
		const site = ( select( SITE_STORE ) as SiteSelect ).getSite( siteId );
		const siteSlug = new URL( site?.URL || '' ).host;

		submit?.( { siteSlug, siteId } );
	};

	const filter = ( site: SiteDetails ) => {
		return !! (
			site.capabilities?.manage_options &&
			( site.is_wpcom_atomic || ! site.jetpack ) &&
			! site.options?.is_wpforteams_site &&
			! site.is_wpcom_staging_site &&
			site.launch_status === 'unlaunched'
		);
	};

	return (
		<>
			<StepContainer
				stepName="site-picker"
				stepContent={
					<div className="site-picker__container">
						<QuerySites allSites />
						<SiteSelector filter={ filter } onSiteSelect={ selectSite } />
					</div>
				}
				formattedHeader={
					<FormattedHeader
						align="center"
						subHeaderAlign="center"
						headerText={ translate( 'Select your site' ) }
					/>
				}
				recordTracksEvent={ recordTracksEvent }
				flowName={ flow }
				hideBack={ ! isSiteAssemblerFlow( flow ) }
				goBack={ goBack }
			/>
		</>
	);
};

export default SitePicker;
