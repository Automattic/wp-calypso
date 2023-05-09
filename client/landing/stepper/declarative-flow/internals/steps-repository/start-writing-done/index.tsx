import { Button, ConfettiAnimation } from '@automattic/components';
import { StepContainer } from '@automattic/onboarding';
import { useSelect } from '@wordpress/data';
import { useTranslate } from 'i18n-calypso';
import { OnboardSelect } from 'calypso/../packages/data-stores/src';
import FormattedHeader from 'calypso/components/formatted-header';
import { useSite } from 'calypso/landing/stepper/hooks/use-site';
import { useSiteSlugParam } from 'calypso/landing/stepper/hooks/use-site-slug-param';
import { ONBOARD_STORE } from 'calypso/landing/stepper/stores';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import StartWritingDoneSitePreview from './site-preview';
import type { Step } from '../../types';

import './styles.scss';

const StartWritingDone: Step = () => {
	const translate = useTranslate();
	const siteSlug = useSiteSlugParam();
	const site = useSite();

	const selectedDomain = useSelect(
		( select ) => ( select( ONBOARD_STORE ) as OnboardSelect ).getSelectedDomain(),
		[]
	);

	// Clear the declarative flow from session storage.
	sessionStorage.setItem( 'declarative-flow', '' );

	if ( ! site ) {
		return null;
	}

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
					subHeaderText={ translate( 'Now it’s time to connect your social accounts.' ) }
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
								{ selectedDomain?.domain_name }
							</div>
						</div>
						<div className="start-writing-done__top-content-cta">
							<Button
								className="start-writing-done__top-content-cta-social"
								primary
								href={ `/marketing/connections/${ siteSlug }` }
							>
								{ translate( 'Connect to social' ) }
							</Button>
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
