import { isDomainFlow, Step, StepContainer } from '@automattic/onboarding';
import { useTranslate } from 'i18n-calypso';
import QuerySites from 'calypso/components/data/query-sites';
import FormattedHeader from 'calypso/components/formatted-header';
import SiteSelector from 'calypso/components/site-selector';
import { shouldUseStepContainerV2 } from 'calypso/landing/stepper/declarative-flow/helpers/should-use-step-container-v2';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import type { Step as StepType } from '../../types';
import type { SiteDetails } from '@automattic/data-stores';
import type { SiteId } from 'calypso/types';

import './styles.scss';

const SitePicker: StepType< {
	submits: {
		siteSlug: string;
		siteId: SiteId;
		site: SiteDetails;
	};
} > = function SitePicker( { navigation, flow } ) {
	const translate = useTranslate();
	const { submit, goBack } = navigation;

	const selectSite = ( siteId: SiteId, site: SiteDetails ) => {
		const siteSlug = site.URL ? new URL( site.URL ).host : '';
		submit?.( { siteSlug, siteId, site } );
	};

	const filter = ( site: SiteDetails ) => {
		const isSiteUnlaunched = isDomainFlow( flow ) ? true : site.launch_status === 'unlaunched';

		return !! (
			site.capabilities?.manage_options &&
			( site.is_wpcom_atomic || ! site.jetpack ) &&
			! site.options?.is_wpforteams_site &&
			! site.is_wpcom_staging_site &&
			isSiteUnlaunched
		);
	};

	const stepContent = (
		<>
			<QuerySites allSites />
			<SiteSelector filter={ filter } onSiteSelect={ selectSite } />
		</>
	);

	if ( shouldUseStepContainerV2( flow ) ) {
		return (
			<Step.CenteredColumnLayout
				columnWidth={ 4 }
				className="step-container-v2--site-picker"
				topBar={
					<Step.TopBar leftElement={ goBack ? <Step.BackButton onClick={ goBack } /> : null } />
				}
				heading={ <Step.Heading text={ translate( 'Select your site' ) } /> }
			>
				{ stepContent }
			</Step.CenteredColumnLayout>
		);
	}

	return (
		<>
			<StepContainer
				stepName="site-picker-step"
				stepContent={ <div className="site-picker__container">{ stepContent }</div> }
				formattedHeader={
					<FormattedHeader align="center" headerText={ translate( 'Select your site' ) } />
				}
				recordTracksEvent={ recordTracksEvent }
				flowName={ flow }
				goBack={ goBack }
				hideBack
			/>
		</>
	);
};

export default SitePicker;
