import { useTranslate } from 'i18n-calypso';
import { BackgroundType10 } from 'calypso/a8c-for-agencies/components/page-section/backgrounds';
import ProfileAvatar1 from 'calypso/assets/images/a8c-for-agencies/hosting/standard-testimonial-1.png';
import ProfileAvatar2 from 'calypso/assets/images/a8c-for-agencies/hosting/standard-testimonial-2.png';
import HostingTestimonialsSection from '../../../common/hosting-testimonials-section';
import ClientRelationships from '../common/client-relationships';
import HostingFeatures from '../common/hosting-features';

export default function StandardAgencyHosting() {
	const translate = useTranslate();

	return (
		<div className="standard-agency-hosting">
			<section className="standard-agency-hosting__plan-selector-container">TODO</section>

			<HostingFeatures heading={ translate( 'Included with every WordPress.com site' ) } />

			<HostingTestimonialsSection
				heading={ translate( 'Love for WordPress.com hosting' ) }
				subheading={ translate( 'What agencies say' ) }
				items={ [
					{
						profile: {
							name: 'Ajit Bohra',
							avatar: ProfileAvatar1,
							title: translate( 'Founder, %(companyName)s', {
								args: {
									companyName: 'LUBUS',
								},
								comment: '%(companyName)s is the name of the company the testimonial is about.',
							} ),
							site: 'lubus.in',
						},
						testimonial: translate(
							'We aimed to provide clients with a reliable hosting service we could endorse without hesitation, ultimately resulting in satisfied clients. We found that service with WordPress.com.'
						),
					},
					{
						profile: {
							name: 'Brian Lalli',
							avatar: ProfileAvatar2,
							title: translate( 'President, %(companyName)s', {
								args: {
									companyName: 'Moon Rooster LLC',
								},
								comment: '%(companyName)s is the name of the company the testimonial is about.',
							} ),
							site: 'moonrooster.com',
						},
						testimonial: translate(
							"WordPress.com has been crucial to my agency's growth. Its intuitive UI allows me to quickly create sleek, functional websites for my clients, and their reliable hosting and support enable me to rest easy, knowing my sites are in good hands."
						),
					},
				] }
			/>

			<ClientRelationships background={ BackgroundType10 } />
		</div>
	);
}
