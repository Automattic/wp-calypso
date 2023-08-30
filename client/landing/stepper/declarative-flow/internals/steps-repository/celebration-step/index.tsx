import { Button, ConfettiAnimation } from '@automattic/components';
import { useLaunchpad } from '@automattic/data-stores';
import { StepContainer } from '@automattic/onboarding';
import { useSelect } from '@wordpress/data';
import DocumentHead from 'calypso/components/data/document-head';
import FormattedHeader from 'calypso/components/formatted-header';
import { useSite } from 'calypso/landing/stepper/hooks/use-site';
import { useSiteSlugParam } from 'calypso/landing/stepper/hooks/use-site-slug-param';
import { ONBOARD_STORE } from 'calypso/landing/stepper/stores';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import SitePreview from '../../components/site-preview';
import useCelebrationData from './use-celebration-data';
import type { Step } from '../../types';
import type { OnboardSelect } from '@automattic/data-stores';

import './styles.scss';

const CelebrationStep: Step = ( { flow, navigation } ) => {
	const siteSlug = useSiteSlugParam() ?? '';
	const site = useSite();
	const { submit } = navigation;

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
		primaryCtaText,
		primaryCtaLink,
		secondaryCtaText,
		secondaryCtaLink,
		dashboardText,
		dashboardLink,
	} = useCelebrationData( {
		flow,
		siteSlug,
		isFirstPostPublished: checklistStatuses?.first_post_published,
	} );

	const handleSubmit = ( destinationUrl: string ) => submit?.( { destinationUrl } );

	if ( ! site ) {
		return null;
	}

	return (
		<>
			<DocumentHead title={ title } />
			<StepContainer
				stepName="celebration-step"
				hideBack={ true }
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
								<div className="celebration-step__top-content-title">{ site?.name }</div>
								<div className="celebration-step__top-content-description">
									{ selectedDomain?.domain_name || siteSlug }
								</div>
							</div>
							<div className="celebration-step__top-content-cta">
								<Button
									className="celebration-step__top-content-cta-primary"
									primary
									onClick={ () => handleSubmit( primaryCtaLink ) }
								>
									{ primaryCtaText }
								</Button>
								<Button
									className="celebration-step__top-content-cta-secondary"
									onClick={ () => handleSubmit( secondaryCtaLink ) }
								>
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
								href={ dashboardLink }
								onClick={ () => handleSubmit( dashboardLink ) }
							>
								{ dashboardText }
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
