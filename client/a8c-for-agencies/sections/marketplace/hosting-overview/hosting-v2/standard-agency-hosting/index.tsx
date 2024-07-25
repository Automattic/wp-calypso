import { JetpackLogo } from '@automattic/components';
import { blockMeta, code, desktop, globe, login, reusableBlock } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import HostingAdditionalFeaturesSection from '../../../common/hosting-additional-features-section';
import HostingFeaturesSection from '../../../common/hosting-features-section';
import { BackgroundType1, BackgroundType2 } from '../../../common/hosting-section/backgrounds';
import HostingTestimonialsSection from '../../../common/hosting-testimonials-section';
import ProfileAvatar1 from './profile-1.jpeg';
import ProfileAvatar2 from './profile-2.png';

export default function StandardAgencyHosting() {
	const translate = useTranslate();

	return (
		<div>
			{ /* Sample Hosting sections */ }
			<HostingAdditionalFeaturesSection
				icon={ <JetpackLogo size={ 16 } /> }
				heading="Supercharge your clients’ sites"
				subheading="Premium Jetpack features included"
				background={ BackgroundType1 }
				items={ [
					'Real-time backups',
					'One-click restores',
					'Site downtime monitoring',
					'Brute-force protection',
					'Elastic-powered search',
					'Optional plugin auto-updates',
					'4K, unbranded VideoPress player',
					'Unlimited auto-shares to social networks',
					'Site activity log',
					'Advanced site stats',
					'Paid subscriptions to site content',
					'Donation / tip buttons',
					'Form and comment spam protection',
					'Custom forms',
				] }
				fiveRows
			/>
			<HostingAdditionalFeaturesSection
				heading="Just for Agencies"
				subheading="Included with all plans and sites"
				items={ [
					'Global edge caching',
					'Global CDN with 28+ locations',
					'Automated datacenter failover',
					'Free managed migrations',
					'Automated malware scanning via Jetpack',
					'Plugin update manager',
					'24/7 expert support',
					'Free staging sites with sync tools',
					'SFTP/SHH, WP-CLI, Git tools',
					'Resource isolation across every site',
				] }
			/>
			<HostingFeaturesSection
				heading="Specialized workflows"
				subheading="Built for developers, by developers"
				background={ BackgroundType2 }
				items={ [
					{
						icon: code,
						title: translate( 'WPI-CLI' ),
						description: translate(
							`Run WP-CLI commands to manage users, plugins, themes, site settings, and more.`
						),
					},
					{
						icon: login,
						title: translate( 'SSH/SFTP' ),
						description: translate(
							'Effortlessly transfer files to and from your site using SFTP and SSH on WordPress.com.'
						),
					},
					{
						icon: reusableBlock,
						title: translate( 'Staging sites' ),
						description: translate(
							`Test changes on a WordPress.com staging site first, so you can identify and fix any vulnerabilities before they impact your live site.`
						),
					},
					{
						icon: desktop,
						title: translate( 'Local development environment' ),
						description: translate(
							'Build fast, ship faster with Studio by WordPress.com, a new local development environment.'
						),
					},
					{
						icon: globe,
						title: translate( 'Domain management' ),
						description: translate(
							'Everything you need to manage your domains—from registration, transfer, and mapping to DNS configuration, email forwarding, and privacy.'
						),
					},
					{
						icon: blockMeta,
						title: translate( 'Easy site migration' ),
						description: translate(
							'Import and take any WordPress site further with our developer-first tools and secure, lightning-fast platform.'
						),
					},
				] }
			/>
			<HostingTestimonialsSection
				heading="What agencies say"
				subheading="Love for WordPress.com hosting"
				items={ [
					{
						profile: {
							avatar: ProfileAvatar1,
							name: 'Ajit Bohra',
							title: 'Founder - LUBUS',
							site: 'lubus.in',
						},
						testimonial:
							'We aimed to provide clients with a reliable hosting service we could endorse without hesitation, ultimately resulting in satisfied clients. We found that service with WordPress.com.',
					},

					{
						profile: {
							avatar: ProfileAvatar2,
							name: 'Anil Gupta',
							title: 'CEO - Multidots',
							site: 'multidots.com',
						},
						testimonial:
							'This should be another WordPress.com specific testimonial. Let’s make sure it touches upon how they love the hosting, the support service, and especially the UI. This is just dummy text.',
					},
				] }
			/>
		</div>
	);
}
