// import { Button, Gridicon } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
// import { useDispatch, useSelector } from 'react-redux';
// import { LicenseFilter } from 'calypso/jetpack-cloud/sections/partner-portal/types';
// import { recordTracksEvent } from 'calypso/state/analytics/actions';
// import { getLicenseCounts } from 'calypso/state/partner-portal/licenses/selectors';
import './style.scss';

export default function OnboardingWidget() {
	const translate = useTranslate();

	return (
		<div className="onboarding-widget__empty-list">
			<h2 className="onboarding-widget__title">
				{ translate( "Let's get started with the Jetpack Pro Dashboard" ) }
			</h2>

			<div className="onboarding-widget__steps">
				<div className="onboarding-widget__step">
					<h3 className="onboarding-widget__step-heading">
						<span className="onboarding-widget__step-ellipse">1</span>
						<span className="onboarding-widget__step-title">Add your Jetpack sites</span>
					</h3>
					<div className="onboarding-widget__video">
						<iframe
							title="VideoPress Video Player"
							aria-label="VideoPress Video Player"
							src="https://video.wordpress.com/embed/HxIseAer?hd=1&amp;autoPlay=0&amp;permalink=1&amp;loop=0&amp;preloadContent=metadata&amp;muted=0&amp;playsinline=0&amp;controls=1&amp;cover=1"
							allowFullScreen
						></iframe>
					</div>
					<p className="onboarding-widget__step-description">
						Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec auctor, nisl eget
						ultricies tincidunt, nisl nisl aliquet nisl, eget aliquet nisl nisl sit amet nisl. Donec
						auctor, nisl eget ultricies tincidunt, nisl nisl aliquet nisl, eget aliquet nisl nisl
						sit amet nisl.
					</p>
				</div>

				<div className="onboarding-widget__step">
					<h3 className="onboarding-widget__step-heading">
						<span className="onboarding-widget__step-ellipse">1</span>
						<span className="onboarding-widget__step-title">Add your Jetpack sites</span>
					</h3>
					<div className="onboarding-widget__video">
						<iframe
							title="VideoPress Video Player"
							aria-label="VideoPress Video Player"
							src="https://video.wordpress.com/embed/HxIseAer?hd=1&amp;autoPlay=0&amp;permalink=1&amp;loop=0&amp;preloadContent=metadata&amp;muted=0&amp;playsinline=0&amp;controls=1&amp;cover=1"
							allowFullScreen
						></iframe>
					</div>
					<p className="onboarding-widget__step-description">
						Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec auctor, nisl eget
						ultricies tincidunt, nisl nisl aliquet nisl, eget aliquet nisl nisl sit amet nisl. Donec
						auctor, nisl eget ultricies tincidunt, nisl nisl aliquet nisl, eget aliquet nisl nisl
						sit amet nisl.
					</p>
				</div>

				{ /* <Button href="/partner-portal/issue-license">{ translate( 'Issue New License' ) }</Button> */ }
			</div>
		</div>
	);
}
