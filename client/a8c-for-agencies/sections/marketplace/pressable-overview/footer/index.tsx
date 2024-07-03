import { blockMeta, info, layout, levelUp, shuffle, tip } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import HostingOverviewFeatures from '../../common/hosting-overview-features';

export default function PressableOverviewFeatures() {
	const translate = useTranslate();

	return (
		<HostingOverviewFeatures
			items={ [
				{
					icon: layout,
					title: translate( 'Intuitive Control Panel' ),
					description: translate(
						`Although it's won awards for being so easy to use, our interface is a powerhouse that delivers for even the most technical of users.`
					),
				},
				{
					icon: info,
					title: translate( '24/7 Expert Support' ),
					description: translate(
						'When you win, we win. That’s why our team of WordPress professionals is always available to help.'
					),
				},
				{
					icon: blockMeta,
					title: translate( 'Easy Migrations' ),
					description: translate(
						`We'll migrate your sites for free or you can use our powerful plugin to do it yourself - we're here to help.`
					),
				},
				{
					icon: levelUp,
					title: translate( '30-Day Money-Back Guarantee' ),
					description: translate(
						'We’re so sure you’ll be satisfied with Pressable that we offer you the world’s best WordPress hosting with no-strings-attached.'
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
	);
}
