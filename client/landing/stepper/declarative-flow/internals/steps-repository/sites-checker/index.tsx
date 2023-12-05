import { SiteDetails } from '@automattic/data-stores';
import { StepContainer, isBlogOnboardingFlow, isSiteAssemblerFlow } from '@automattic/onboarding';
import { useI18n } from '@wordpress/react-i18n';
import { useEffect } from 'react';
import DocumentHead from 'calypso/components/data/document-head';
import QuerySites from 'calypso/components/data/query-sites';
import { LoadingEllipsis } from 'calypso/components/loading-ellipsis';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { useSelector } from 'calypso/state';
import getSites from 'calypso/state/selectors/get-sites';
import { hasAllSitesList } from 'calypso/state/sites/selectors';
import type { Step } from '../../types';

import './styles.scss';

const SitesChecker: Step = function SitePicker( { navigation, flow } ) {
	const { __ } = useI18n();
	const { submit } = navigation;
	const hasAllSitesFetched = useSelector( ( state ) => hasAllSitesList( state ) );
	const allSites = useSelector( ( state ) => getSites( state ) );

	useEffect( () => {
		if ( hasAllSitesFetched ) {
			const filteredSites =
				isBlogOnboardingFlow( flow ) || isSiteAssemblerFlow( flow )
					? allSites?.filter(
							( site: SiteDetails | null | undefined ) => site?.launch_status === 'unlaunched'
					  )
					: allSites;
			submit?.( { filteredSitesCount: filteredSites.length } );
			return;
		}
	} );

	return (
		<>
			<DocumentHead title={ __( 'Checking sites' ) } />
			<QuerySites allSites />
			<StepContainer
				shouldHideNavButtons={ true }
				hideFormattedHeader={ true }
				stepName="sites-checker-step"
				stepContent={
					<>
						<div className="sites-checker-step">
							<h1 className="sites-checker-step__progress-step">{ __( 'Checking sites' ) }</h1>
							<LoadingEllipsis />
						</div>
					</>
				}
				recordTracksEvent={ recordTracksEvent }
			/>
		</>
	);
};

export default SitesChecker;
