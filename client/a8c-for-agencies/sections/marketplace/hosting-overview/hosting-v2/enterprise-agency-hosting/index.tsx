import { VIPLogo } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import ProfileAvatar1 from 'calypso/assets/images/a8c-for-agencies/hosting/enterprise-testimonial-1.png';
import ProfileAvatar2 from 'calypso/assets/images/a8c-for-agencies/hosting/enterprise-testimonial-2.png';
import HostingAdditionalFeaturesSection from '../../../common/hosting-additional-features-section';
import { BackgroundType4 } from '../../../common/hosting-section/backgrounds';
import HostingTestimonialsSection from '../../../common/hosting-testimonials-section';

export default function EnterpriseAgencyHosting() {
	const translate = useTranslate();

	return (
		<>
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
							title: 'Vice President, Kaiser Family Foundation',
							site: translate( 'Read the case study' ),
							siteLink:
								'https://wpvip.com/case-studies/evolving-the-kaiser-family-foundations-data-rich-platforms/',
						},
						testimonial:
							// TODO: Change this to a real testimonial
							"In the past, the staff didn't touch the CMS. They wrote things in Word, sent it to the production team, and they put it online. With WordPress, that workflow is changing slowly and dramatically." +
							" We've trained many of our content creators in the CMS. And, the closer the content creators are to it, the more creatively they are able to think about it.",
					},

					{
						profile: {
							avatar: ProfileAvatar2,
							name: 'Joel Davies',
							title: 'Head of Editorial Operations, News UK',
							site: translate( 'Read the case study' ),
							siteLink:
								'https://wpvip.com/case-studies/behind-the-scenes-of-news-uks-rampant-speed-to-value-with-gutenberg/',
						},
						testimonial:
							// TODO: Change this to a real testimonial
							'With Gutenberg, we were able to publish a breaking news story in two minutes versus five minutes in Classic [WordPress].' +
							" The main reason for this is the reusable blocks which have been renamed 'The Game Changer.'",
					},
				] }
				itemBackgroundColor="#F5F2F1"
			/>
		</>
	);
}
