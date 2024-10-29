import { VIPLogo, SalesforceLogo, SlackLogo, CNNLogo } from '@automattic/components';
import { Button } from '@wordpress/components';
import { Icon, external } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { BackgroundType4 } from 'calypso/a8c-for-agencies/components/page-section/backgrounds';
import ProfileAvatar1 from 'calypso/assets/images/a8c-for-agencies/hosting/enterprise-testimonial-1.png';
import ProfileAvatar2 from 'calypso/assets/images/a8c-for-agencies/hosting/enterprise-testimonial-2.png';
import CapeGeminiLogo from 'calypso/assets/images/logos/capgemini.svg';
import MetaLogo from 'calypso/assets/images/logos/meta.svg';
import NewYorkPostLogo from 'calypso/assets/images/logos/new-york-post.svg';
import NewsCorpLogo from 'calypso/assets/images/logos/news-corp.svg';
import SpotifyLogo from 'calypso/assets/images/logos/spotify.svg';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import HostingAdditionalFeaturesSection from '../../../common/hosting-additional-features-section';
import HostingTestimonialsSection from '../../../common/hosting-testimonials-section';
import SimpleList from '../../../common/simple-list';

import './style.scss';

export default function EnterpriseAgencyHosting() {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const onRequestDemoClick = () => {
		dispatch(
			recordTracksEvent( 'calypso_a4a_marketplace_hosting_enterprise_request_demo_click' )
		);
	};

	return (
		<>
			<div className="enterprise-agency-hosting__top-container">
				<div className="enterprise-agency-hosting__details">
					<div className="enterprise-agency-hosting__details-heading">
						{ translate( 'Enterprise CMS' ) }
					</div>
					<SimpleList
						items={ [
							translate( 'Unmatched flexibility to build a customized web experience' ),
							translate( 'Tools to increase customer engagement' ),
							translate(
								'Scalability to ensure top-notch site performance during campaigns or events'
							),
						] }
					/>
					<Button
						href="https://wpvip.com/partner-application/?utm_source=partner&utm_medium=referral&utm_campaign=a4a"
						onClick={ onRequestDemoClick }
						target="_blank"
						variant="primary"
					>
						{ translate( 'Request a Demo' ) } <Icon icon={ external } size={ 16 } />
					</Button>
				</div>
				<div className="enterprise-agency-hosting__details">
					<div className="enterprise-agency-hosting__details-heading">
						{ translate( 'The platform the biggest{{br/}}brands trust.', {
							components: {
								br: <br />,
							},
						} ) }
					</div>
					<div className="enterprise-agency-hosting__logos">
						<SalesforceLogo />
						<img src={ MetaLogo } alt="Meta" />
						<SlackLogo />
						<img src={ SpotifyLogo } alt="Spotify" />
						<CNNLogo />
						<img src={ NewsCorpLogo } alt="News Corp" />
						<img src={ CapeGeminiLogo } alt="Capgemini" />
						<img src={ NewYorkPostLogo } alt="New York Post" />
					</div>
				</div>
			</div>
			<HostingAdditionalFeaturesSection
				icon={ <VIPLogo height={ 16 } width={ 35 } /> }
				heading={ translate( 'VIP Capabilities ' ) }
				subheading={ translate( 'The leading content platform' ) }
				description={ translate(
					'Combine the ease of WordPress with enterprise-grade security and scalability.'
				) }
				background={ BackgroundType4 }
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
		</>
	);
}
