import { JetpackLogo } from '@automattic/components';
import { blockMeta, code, desktop, globe, login, reusableBlock } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import ProfileAvatar1 from 'calypso/assets/images/a8c-for-agencies/hosting/standard-testimonial-1.png';
import ProfileAvatar2 from 'calypso/assets/images/a8c-for-agencies/hosting/standard-testimonial-2.png';
import { APIProductFamilyProduct } from 'calypso/state/partner-portal/types';
import HostingAdditionalFeaturesSection from '../../../common/hosting-additional-features-section';
import HostingFeaturesSection from '../../../common/hosting-features-section';
import { BackgroundType1, BackgroundType2 } from '../../../common/hosting-section/backgrounds';
import HostingTestimonialsSection from '../../../common/hosting-testimonials-section';
import CommonHostingBenefits from '../common-hosting-benefits';
import WPCOMPlanSelector from './wpcom-plan-selector';

import './style.scss';

type Props = {
	onAddToCart: ( plan: APIProductFamilyProduct, quantity: number ) => void;
};

export default function StandardAgencyHosting( { onAddToCart }: Props ) {
	const translate = useTranslate();

	return (
		<div className="standard-agency-hosting">
			<section className="standard-agency-hosting__plan-selector-container">
				<WPCOMPlanSelector onSelect={ onAddToCart } />
			</section>

			<HostingAdditionalFeaturesSection
				icon={ <JetpackLogo size={ 16 } /> }
				heading={ translate( 'Premium Jetpack features included' ) }
				subheading={ translate( 'Supercharge your clients’ sites' ) }
				background={ BackgroundType1 }
				items={ [
					translate( 'Real-time backups' ),
					translate( 'One-click restores' ),
					translate( 'Site downtime monitoring' ),
					translate( 'Brute-force protection' ),
					translate( 'Elastic-powered search' ),
					translate( 'Optional plugin auto-updates' ),
					translate( '4K, unbranded VideoPress player' ),
					translate( 'Unlimited auto-shares to social networks' ),
					translate( 'Site activity log' ),
					translate( 'Advanced site stats' ),
					translate( 'Paid subscriptions to site content' ),
					translate( 'Donation / tip buttons' ),
					translate( 'Form and comment spam protection' ),
					translate( 'Custom forms' ),
				] }
				fiveRows
			/>
			<HostingAdditionalFeaturesSection
				heading={ translate( 'Included with all plans and sites' ) }
				subheading={ translate( 'Just for Agencies' ) }
				items={ [
					translate( 'Global edge caching' ),
					translate( 'Global CDN with 28+ locations' ),
					translate( 'Automated datacenter failover' ),
					translate( 'Free managed migrations' ),
					translate( 'Automated malware scanning via Jetpack' ),
					translate( 'Plugin update manager' ),
					translate( '24/7 expert support' ),
					translate( 'Free staging sites with sync tools' ),
					translate( 'SFTP/SSH, WP-CLI, Git tools' ),
					translate( 'Resource isolation across every site' ),
				] }
			/>
			<HostingFeaturesSection
				heading={ translate( 'Built for developers, by developers' ) }
				subheading={ translate( 'Specialized workflows' ) }
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
			<CommonHostingBenefits />
		</div>
	);
}
