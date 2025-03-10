import { Button, ConfettiAnimation } from '@automattic/components';
import { useLaunchpad } from '@automattic/data-stores';
import { StepContainer } from '@automattic/onboarding';
import { useSelect } from '@wordpress/data';
import DocumentHead from 'calypso/components/data/document-head';
import FormattedHeader from 'calypso/components/formatted-header';
import { useSite } from 'calypso/landing/stepper/hooks/use-site';
import { ONBOARD_STORE } from 'calypso/landing/stepper/stores';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { urlToSlug } from 'calypso/lib/url';
import SitePreview from '../../components/site-preview';
import useCelebrationData from './use-celebration-data';
import type { Step } from '../../types';
import type { OnboardSelect } from '@automattic/data-stores';

import './styles.scss';

const CelebrationStep: Step = ( { flow, navigation } ) => {
	const { submit } = navigation;

	const site = useSite();
	const siteSlug = urlToSlug( site?.URL ?? '' );

	const selectedDomain = useSelect(
		( select ) => ( select( ONBOARD_STORE ) as OnboardSelect ).getSelectedDomain(),
		[]
	);

	const {
		data: { checklist_statuses: checklistStatuses },
	} = useLaunchpad( siteSlug );

	const {
		title,
		subTitle,
		primaryCtaName,
		primaryCtaText,
		primaryCtaLink,
		secondaryCtaName,
		secondaryCtaText,
		secondaryCtaLink,
		dashboardCtaName,
		dashboardCtaText,
		dashboardCtaLink,
	} = useCelebrationData( {
		flow,
		siteSlug,
		isFirstPostPublished: checklistStatuses?.first_post_published,
	} );

	const handleSubmit = ( destinationName: string, destinationUrl: string ) =>
		submit?.( { destinationName, destinationUrl } );

	if ( ! site ) {
		return null;
	}

	return (
		<>
			<DocumentHead title={ title } />
			<StepContainer
				stepName="celebration-step"
				hideBack
				flowName={ flow }
				formattedHeader={
					<FormattedHeader
						id="celebration-step-header"
						headerText={ title }
						subHeaderText={ subTitle }
					/>
				}
				stepContent={
					<>
						<ConfettiAnimation />
						<div className="celebration-step__top-content">
							<div className="celebration-step__top-content-main">
								<div className="celebration-step__top-content-title" title={ site?.name }>
									{ site?.name }
								</div>
								<div
									className="celebration-step__top-content-description"
									title={ selectedDomain?.domain_name || siteSlug }
								>
									{ selectedDomain?.domain_name || siteSlug }
								</div>
							</div>
							<div className="celebration-step__top-content-cta">
								<Button primary onClick={ () => handleSubmit( primaryCtaName, primaryCtaLink ) }>
									{ primaryCtaText }
								</Button>
								<Button onClick={ () => handleSubmit( secondaryCtaName, secondaryCtaLink ) }>
									{ secondaryCtaText }
								</Button>
							</div>
						</div>
						<SitePreview siteSlug={ siteSlug } />
						<footer className="celebration-step__footer">
							<Button
								className="celebration-step__footer-link"
								transparent
								borderless
								href={ dashboardCtaLink }
								onClick={ () => handleSubmit( dashboardCtaName, dashboardCtaLink ) }
							>
								{ dashboardCtaText }
							</Button>
						</footer>
					</>
				}
				recordTracksEvent={ recordTracksEvent }
			/>
		</>
	);
};

export default CelebrationStep;
