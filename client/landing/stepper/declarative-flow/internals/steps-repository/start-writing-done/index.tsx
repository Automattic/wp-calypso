import { Button, ConfettiAnimation } from '@automattic/components';
import { StepContainer, isStartWritingFlow } from '@automattic/onboarding';
import { useSelect } from '@wordpress/data';
import { useTranslate } from 'i18n-calypso';
import { OnboardSelect } from 'calypso/../packages/data-stores/src';
import FormattedHeader from 'calypso/components/formatted-header';
import { useLaunchpad } from 'calypso/data/sites/use-launchpad';
import { useSite } from 'calypso/landing/stepper/hooks/use-site';
import { useSiteSlugParam } from 'calypso/landing/stepper/hooks/use-site-slug-param';
import { ONBOARD_STORE } from 'calypso/landing/stepper/stores';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import StartWritingDoneSitePreview from './site-preview';
import type { Step } from '../../types';

import './styles.scss';

const StartWritingDone: Step = ( { flow } ) => {
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

	const isFirstPostPublished = checklistStatuses.first_post_published;

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
			<Button className="start-writing-done__top-content-cta-social" primary href={ mainCtaLink }>
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
			stepName="start-writing-done"
			isWideLayout={ true }
			hideBack={ true }
			flowName="free"
			formattedHeader={
				<FormattedHeader
					id="start-writing-done-header"
					headerText={ translate( 'Your blog’s ready!' ) }
					subHeaderText={ subtitleText }
					align="center"
					subHeaderAlign="center"
				/>
			}
			stepContent={
				<>
					<ConfettiAnimation />
					<div className="start-writing-done__top-content">
						<div className="start-writing-done__top-content-main">
							<div className="start-writing-done__top-content-title">{ site?.name }</div>
							<div className="start-writing-done__top-content-description">
								{ selectedDomain?.domain_name || siteSlug }
							</div>
						</div>
						<div className="start-writing-done__top-content-cta">
							<MainCta />
							<Button
								className="start-writing-done__top-content-cta-blog"
								href={ `https://${ siteSlug }` }
							>
								{ translate( 'Visit your blog' ) }
							</Button>
						</div>
					</div>
					<StartWritingDoneSitePreview siteSlug={ siteSlug } />
					<footer className="start-writing-done__footer">
						<a className="start-writing-done__footer-link" href={ `/home/${ siteSlug }` }>
							Go to dashboard
						</a>
					</footer>
				</>
			}
			recordTracksEvent={ recordTracksEvent }
		/>
	);
};

export default StartWritingDone;
