import { JetpackLogo } from '@automattic/components';
import { layout, blockMeta, shuffle, help, keyboardReturn, tip } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import ProfileAvatar1 from 'calypso/assets/images/a8c-for-agencies/hosting/premier-testimonial-1.png';
import ProfileAvatar2 from 'calypso/assets/images/a8c-for-agencies/hosting/premier-testimonial-2.png';
import { APIProductFamilyProduct } from 'calypso/state/partner-portal/types';
import HostingAdditionalFeaturesSection from '../../../common/hosting-additional-features-section';
import HostingFeaturesSection from '../../../common/hosting-features-section';
import { BackgroundType1, BackgroundType2 } from '../../../common/hosting-section/backgrounds';
import HostingTestimonialsSection from '../../../common/hosting-testimonials-section';
import PressableOverviewPlanSelection from '../../../pressable-overview/plan-selection';
import CommonHostingBenefits from '../common-hosting-benefits';

import './style.scss';

type Props = {
	onAddToCart: ( plan: APIProductFamilyProduct ) => void;
};

export default function PremierAgencyHosting( { onAddToCart }: Props ) {
	const translate = useTranslate();

	return (
		<div className="premier-agency-hosting">
			<PressableOverviewPlanSelection onAddToCart={ onAddToCart } />
			<HostingAdditionalFeaturesSection
				icon={ <JetpackLogo size={ 16 } /> }
				heading={ translate( 'Jetpack Complete included' ) }
				subheading={ translate( "Supercharge your clients' sites" ) }
				description={ translate(
					'Every site built on Pressable comes with Jetpack Complete for free - a $599/year/site value.'
				) }
				background={ BackgroundType1 }
				items={ [
					translate( 'Real-time backups' ),
					translate( 'Site activity log' ),
					translate( 'Site downtime monitoring' ),
					translate( 'Real-time malware scans' ),
					translate( 'Brute-force protection' ),
					translate( 'Automated plugin updates' ),
					translate( 'Spam protection (comments and forms)' ),
					translate( 'Security authentication' ),
				] }
				threeRows
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
				heading={ translate( 'Flexible plans designed to grow with your business' ) }
				subheading={ translate( 'Trouble free growth' ) }
				background={ { ...BackgroundType2 } }
				items={ [
					{
						icon: layout,
						title: translate( 'Intuitive Control Panel' ),
						description: translate(
							"Although it's won awards for being so easy to use, our interface is a powerhouse that delivers for even the most technical of users."
						),
					},
					{
						icon: help,
						title: translate( '24/7 Expert Support' ),
						description: translate(
							"When you win, we win. That's why our team of WordPress professionals is always available to help."
						),
					},
					{
						icon: blockMeta,
						title: translate( 'Easy Migrations' ),
						description: translate(
							"We'll migrate your sites for free or you can use our powerful plugin to do it yourself - we're here to help."
						),
					},
					{
						icon: keyboardReturn,
						title: translate( '30-Day Money-Back Guarantee' ),
						description: translate(
							"We're so sure you'll be satisfied with Pressable that we offer you the world's best WordPress hosting with no-strings-attached."
						),
					},
					{
						icon: shuffle,
						title: translate( 'Flexible Upgrades & Downgrades' ),
						description: translate(
							'Need to make a change? No problem. Our plans are flexible, so they grow with your business.'
						),
					},
					{
						icon: tip,
						title: translate( '100% Uptime Guarantee' ),
						description: translate(
							'You need reliability - we promise it. Our cloud-based architecture ensures success by making your site available all day, every day.'
						),
					},
				] }
			/>
			<HostingTestimonialsSection
				heading={ translate( 'Love for Pressable hosting' ) }
				subheading={ translate( 'What agencies say' ) }
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
							name: 'Justin Barrett',
							avatar: ProfileAvatar2,
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
			/>
			<CommonHostingBenefits />
		</div>
	);
}
