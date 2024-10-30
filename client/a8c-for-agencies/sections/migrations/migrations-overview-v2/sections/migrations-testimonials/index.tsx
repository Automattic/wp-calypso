import { useTranslate } from 'i18n-calypso';
import { BackgroundType6 } from 'calypso/a8c-for-agencies/components/page-section/backgrounds';
import HostingTestimonialsSection from 'calypso/a8c-for-agencies/sections/marketplace/common/hosting-testimonials-section';
import ProfileAvatar1 from 'calypso/assets/images/a8c-for-agencies/hosting/premier-testimonial-1.png';
import ProfileAvatar5 from 'calypso/assets/images/a8c-for-agencies/hosting/premier-testimonial-2.png';
import ProfileAvatar4 from 'calypso/assets/images/a8c-for-agencies/hosting/standard-testimonial-1.png';
import ProfileAvatar2 from 'calypso/assets/images/a8c-for-agencies/hosting/standard-testimonial-2.png';
import ProfileAvatar3 from 'calypso/assets/images/a8c-for-agencies/hosting/standard-testimonial-3.png';

import './style.scss';

export default function MigrationsTestimonials() {
	const translate = useTranslate();
	return (
		<HostingTestimonialsSection
			heading={ translate( 'You’re in good company' ) }
			description={ translate( 'Don’t just take our word for it. Hear from our customers.' ) }
			background={ BackgroundType6 }
			items={ [
				{
					profile: {
						avatar: ProfileAvatar1,
						name: 'Ben Giordano',
						title: translate( 'Founder, %(companyName)s', {
							args: {
								companyName: 'Freshy',
							},
							comment: '%(companyName)s is the name of the company the testimonial is about.',
						} ),
						site: 'freshysites.com',
					},
					testimonial:
						"We needed a hosting provider that was as knowledgeable about WordPress as we are. With Pressable's affiliation with Automattic, the same people behind WordPress.com and WordPress VIP, we knew we'd found the right home for our client portfolio.",
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

				{
					profile: {
						name: 'Sonia Gaballa',
						avatar: ProfileAvatar3,
						title: translate( 'Partner', {
							args: {
								companyName: 'nudge.design',
							},
							comment: '%(companyName)s is the name of the company the testimonial is about.',
						} ),
						site: 'nudge.design',
					},
					testimonial: translate(
						'WordPress.com really stands out with its exceptional performance and strong security. It’s a versatile platform that’s great for users at any skill level, and their support team is always incredibly helpful. For managed sites, we definitely think WordPress.com is the way to go.'
					),
				},

				{
					profile: {
						name: 'Ajit Bohra',
						avatar: ProfileAvatar4,
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
						name: 'Justin Barrett',
						avatar: ProfileAvatar5,
						title: translate( 'Director of Technology, %(companyName)s', {
							args: {
								companyName: 'Autoshop Solutions',
							},
							comment: '%(companyName)s is the name of the company the testimonial is about.',
						} ),
						site: 'autoshopsolutions.com',
					},
					testimonial:
						'As an agency with hundreds of clients, Pressable changed the game for our ability to grow as a business and offer best-in-class products for our clients. With fantastic support, superior uptime, and solutions to make even the largest challenges possible, Pressable is always there.',
				},
			] }
			itemBackgroundColor="#FFF"
		/>
	);
}
