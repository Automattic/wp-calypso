import { Button, ConfettiAnimation } from '@automattic/components';
import { useLaunchpad } from '@automattic/data-stores';
import { StepContainer, isStartWritingFlow } from '@automattic/onboarding';
import { useSelect } from '@wordpress/data';
import { useTranslate } from 'i18n-calypso';
import { OnboardSelect } from 'calypso/../packages/data-stores/src';
import FormattedHeader from 'calypso/components/formatted-header';
import { useSite } from 'calypso/landing/stepper/hooks/use-site';
import { useSiteSlugParam } from 'calypso/landing/stepper/hooks/use-site-slug-param';
import { ONBOARD_STORE } from 'calypso/landing/stepper/stores';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import CelebrationStepSitePreview from './site-preview';
import type { Step } from '../../types';

import './styles.scss';

const CelebrationStep: Step = ( { flow } ) => {
	const translate = useTranslate();
	const siteSlug = useSiteSlugParam();
	const site = useSite();

	const selectedDomain = useSelect(
		( select ) => ( select( ONBOARD_STORE ) as OnboardSelect ).getSelectedDomain(),
		[]
	);

	const {
		data: { checklist_statuses: checklistStatuses },
	} = useLaunchpad( siteSlug );

	if ( ! site ) {
		return null;
	}

	const isFirstPostPublished = checklistStatuses?.first_post_published;

	const MainCta = () => {
		const mainCtaText =
			isStartWritingFlow( flow ) || isFirstPostPublished
				? translate( 'Connect to social' )
				: translate( 'Write your first post' );

		const mainCtaLink =
			isStartWritingFlow( flow ) || isFirstPostPublished
				? `/marketing/connections/${ siteSlug }`
				: `/post/${ siteSlug }`;

		return (
			<Button className="celebration-step__top-content-cta-social" primary href={ mainCtaLink }>
				{ mainCtaText }
			</Button>
		);
	};

	const subtitleText =
		isStartWritingFlow( flow ) || isFirstPostPublished
			? translate( 'Now it’s time to connect your social accounts.' )
			: translate( 'Now it’s time to start posting.' );

	return (
		<StepContainer
			stepName="celebration-step"
			isWideLayout={ true }
			hideBack={ true }
			flowName="free"
			formattedHeader={
				<FormattedHeader
					id="celebration-step-header"
					headerText={ translate( 'Your blog’s ready!' ) }
					subHeaderText={ subtitleText }
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
							<MainCta />
							<Button
								className="celebration-step__top-content-cta-blog"
								href={ `https://${ siteSlug }` }
							>
								{ translate( 'Visit your blog' ) }
							</Button>
						</div>
					</div>
					<CelebrationStepSitePreview siteSlug={ siteSlug } />
					<footer className="celebration-step__footer">
						<a className="celebration-step__footer-link" href={ `/home/${ siteSlug }` }>
							Go to dashboard
						</a>
					</footer>
				</>
			}
			recordTracksEvent={ recordTracksEvent }
		/>
	);
};

export default CelebrationStep;
