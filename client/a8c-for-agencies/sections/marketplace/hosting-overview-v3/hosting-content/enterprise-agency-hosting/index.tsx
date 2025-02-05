import { VIPLogo } from '@automattic/components';
import { Button } from '@wordpress/components';
import { Icon, external } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { BackgroundType11 } from 'calypso/a8c-for-agencies/components/page-section/backgrounds';
import SimpleList from 'calypso/a8c-for-agencies/components/simple-list';
import ProfileAvatar1 from 'calypso/assets/images/a8c-for-agencies/hosting/enterprise-testimonial-1.png';
import ProfileAvatar2 from 'calypso/assets/images/a8c-for-agencies/hosting/enterprise-testimonial-2.png';
import CNNLogo from 'calypso/assets/images/logos/cnn.svg';
import MetaLogo from 'calypso/assets/images/logos/meta.svg';
import NewYorkPostLogo from 'calypso/assets/images/logos/new-york-post.svg';
import NewsCorpLogo from 'calypso/assets/images/logos/news-corp.svg';
import SalesforceLogo from 'calypso/assets/images/logos/salesforce.svg';
import SlackLogo from 'calypso/assets/images/logos/slack.svg';
import SpotifyLogo from 'calypso/assets/images/logos/spotify.svg';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import HostingAdditionalFeaturesSection from '../../../common/hosting-additional-features-section';
import HostingTestimonialsSection from '../../../common/hosting-testimonials-section';
import HostingPlanSection from '../common/hosting-plan-section';

import './style.scss';

export default function EnterpriseAgencyHosting( { isReferMode }: { isReferMode: boolean } ) {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const onRequestDemoClick = () => {
		dispatch(
			recordTracksEvent( 'calypso_a4a_marketplace_hosting_enterprise_request_demo_click' )
		);
	};

	const onReferClientClick = () => {
		dispatch(
			recordTracksEvent( 'calypso_a4a_marketplace_hosting_enterprise_refer_client_click' )
		);
	};

	return (
		<div className="enterprise-agency-hosting-v3">
			<HostingPlanSection
				heading={ translate(
					'Deliver unmatched performance with the highest security standards on our enterprise platform'
				) }
			>
				<HostingPlanSection.Card>
					<div className="enterprise-agency-hosting__top">
						<div className="enterprise-agency-hosting__top-heading">
							<VIPLogo width={ 57 } height={ 25 } /> | { translate( 'Enterprise WordPress' ) }
						</div>

						<div className="enterprise-agency-hosting__top-subheading">
							{ translate( 'Custom pricing' ) }
						</div>
					</div>

					<Button
						className="enterprise-agency-hosting-v3__cta-button"
						href="https://wpvip.com/partner-application/?utm_source=partner&utm_medium=referral&utm_campaign=a4a"
						onClick={ isReferMode ? onReferClientClick : onRequestDemoClick }
						target="_blank"
						variant="primary"
					>
						{ isReferMode ? translate( 'Refer client' ) : translate( 'Request a Demo' ) }
						<Icon icon={ external } size={ 16 } />
					</Button>
				</HostingPlanSection.Card>

				<HostingPlanSection.Details
					heading={ translate( 'The platform the biggest brands trust.' ) }
				>
					{ isReferMode && (
						<div className="enterprise-agency-hosting-v3__top-details-subheading">
							{ translate(
								'Earn a one-time 5% commission on client referrals to WordPress VIP. {{a}}Full Terms{{/a}} ↗',
								{
									components: {
										a: (
											<a
												href="https://automattic.com/for-agencies/program-incentives"
												target="_blank"
												rel="noopener noreferrer"
											/>
										),
									},
								}
							) }
						</div>
					) }

					<SimpleList
						items={ [
							translate( 'Unmatched flexibility to build a customized web experience' ),
							translate( 'Tools to increase customer engagement' ),
							translate(
								'Scalability to ensure top-notch site performance during campaigns or events'
							),
						] }
					/>

					<div className="enterprise-agency-hosting-v3__logos">
						<div className="enterprise-agency-hosting-v3__logos-item">
							<img src={ SalesforceLogo } alt="Salesforce" />
						</div>
						<div className="enterprise-agency-hosting-v3__logos-item">
							<img src={ MetaLogo } alt="Meta" />
						</div>
						<div className="enterprise-agency-hosting-v3__logos-item">
							<img src={ SlackLogo } alt="Slack" />
						</div>
						<div className="enterprise-agency-hosting-v3__logos-item">
							<img src={ SpotifyLogo } alt="Spotify" />
						</div>
						<div className="enterprise-agency-hosting-v3__logos-item">
							<img src={ CNNLogo } alt="CNN" />
						</div>
						<div className="enterprise-agency-hosting-v3__logos-item">
							<img src={ NewsCorpLogo } alt="News Corp" />
						</div>
						<div className="enterprise-agency-hosting-v3__logos-item">
							<img src={ NewYorkPostLogo } alt="New York Post" />
						</div>
					</div>
				</HostingPlanSection.Details>
			</HostingPlanSection>

			<HostingAdditionalFeaturesSection
				heading={ translate( 'VIP Capabilities ' ) }
				subheading={ translate( 'The leading content platform' ) }
				description={ translate(
					'Combine the ease of WordPress with enterprise-grade security and scalability.'
				) }
				background={ BackgroundType11 }
				items={ [
					translate( 'Rapid content authoring' ),
					translate( 'Experience creation' ),
					translate( 'Content guidance' ),
					translate( 'Headless CMS' ),
					translate( 'Development tools' ),
					translate( 'Scalable platform' ),
					translate( 'Enterprise-grade security' ),
					translate( 'Website management' ),
					translate( 'Integrated commerce' ),
				] }
				threeRows
			/>
			<HostingTestimonialsSection
				heading={ translate( 'Love for VIP hosting' ) }
				subheading={ translate( 'What agencies say' ) }
				items={ [
					{
						profile: {
							avatar: ProfileAvatar1,
							name: 'David Rousseau',
							title: translate( 'Vice President, %(companyName)s', {
								args: {
									companyName: 'Kaiser Family Foundation',
								},
								comment: '%(companyName)s is the name of the company the testimonial is about.',
							} ),
							site: translate( 'Read the case study' ),
							siteLink:
								'https://wpvip.com/case-studies/evolving-the-kaiser-family-foundations-data-rich-platforms/',
						},
						testimonial: translate(
							"In the past, the staff didn't touch the CMS. They wrote things in Word, sent it to the production team, and they put it online. With WordPress, that workflow is changing slowly and dramatically." +
								" We've trained many of our content creators in the CMS. And, the closer the content creators are to it, the more creatively they are able to think about it."
						),
					},

					{
						profile: {
							avatar: ProfileAvatar2,
							name: 'Joel Davies',
							title: translate( 'Head of Editorial Operations, %(companyName)s', {
								args: {
									companyName: 'News UK',
								},
								comment: '%(companyName)s is the name of the company the testimonial is about.',
							} ),
							site: translate( 'Read the case study' ),
							siteLink:
								'https://wpvip.com/case-studies/behind-the-scenes-of-news-uks-rampant-speed-to-value-with-gutenberg/',
						},
						testimonial: translate(
							'With Gutenberg, we were able to publish a breaking news story in two minutes versus five minutes in Classic [WordPress].' +
								" The main reason for this is the reusable blocks which have been renamed 'The Game Changer.'"
						),
					},
				] }
				itemBackgroundColor="#F5F2F1"
			/>
		</div>
	);
}
