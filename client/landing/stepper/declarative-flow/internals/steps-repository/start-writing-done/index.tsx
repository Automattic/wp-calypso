import { Button, ConfettiAnimation } from '@automattic/components';
import { StepContainer } from '@automattic/onboarding';
import { useTranslate } from 'i18n-calypso';
import FormattedHeader from 'calypso/components/formatted-header';
import { useSiteSlugParam } from 'calypso/landing/stepper/hooks/use-site-slug-param';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import StartWritingDoneSitePreview from './site-preview';
import type { Step } from '../../types';

import './styles.scss';

const StartWritingDone: Step = () => {
	const translate = useTranslate();
	const siteSlug = useSiteSlugParam();
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
							<div className="start-writing-done__top-content-title">Notes by Livro</div>
							<div className="start-writing-done__top-content-description">{ siteSlug }</div>
						</div>
						<div className="start-writing-done__top-content-cta">
							<Button className="start-writing-done__top-content-cta-social" primary>
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
