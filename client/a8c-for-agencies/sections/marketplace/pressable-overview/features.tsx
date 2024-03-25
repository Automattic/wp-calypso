import { useTranslate } from 'i18n-calypso';

export default function PressableOverviewFeatures() {
	const translate = useTranslate();

	return (
		<>
			<section className="pressable-overview__banner">
				<h1 className="pressable-overview__banner-title">
					{ translate( 'The Pressable Promise' ) }
				</h1>

				<h2 className="pressable-overview__banner-subtitle">
					{ translate( 'Flexible plans that are designed to grow with your business.' ) }
				</h2>
			</section>

			<div className="pressable-overview__features">
				<div className="pressable-overview__features-item">
					<div className="pressable-overview__features-item-title">
						{ translate( 'Intuitive Control Panel' ) }
					</div>
					<div className="pressable-overview__features-item-description">
						{ translate(
							`Although it's won awards for being so easy to use, our interface is a powerhouse that delivers for even the most technical of users.`
						) }
					</div>
				</div>

				<div className="pressable-overview__features-item">
					<div className="pressable-overview__features-item-title">
						{ translate( 'Easy Migrations' ) }
					</div>
					<div className="pressable-overview__features-item-description">
						{ translate(
							`We'll migrate your sites for free or you can use our powerful plugin to do it yourself - we're here to help.`
						) }
					</div>
				</div>

				<div className="pressable-overview__features-item">
					<div className="pressable-overview__features-item-title">
						{ translate( 'Flexible Upgrades & Downgrades' ) }
					</div>
					<div className="pressable-overview__features-item-description">
						{ translate(
							'Need to make a change? No problem. Our plans are flexible, so they grow with your business.'
						) }
					</div>
				</div>

				<div className="pressable-overview__features-item">
					<div className="pressable-overview__features-item-title">
						{ translate( '24/7 Expert Support' ) }
					</div>
					<div className="pressable-overview__features-item-description">
						{ translate(
							'When you win, we win. That’s why our team of WordPress professionals is always available to help.'
						) }
					</div>
				</div>

				<div className="pressable-overview__features-item">
					<div className="pressable-overview__features-item-title">
						{ translate( '30-Day Money-Back Guarantee' ) }
					</div>
					<div className="pressable-overview__features-item-description">
						{ translate(
							'We’re so sure you’ll be satisfied with Pressable that we offer you the world’s best WordPress hosting with no-strings-attached.'
						) }
					</div>
				</div>

				<div className="pressable-overview__features-item">
					<div className="pressable-overview__features-item-title">
						{ translate( '100% Uptime Guarantee' ) }
					</div>
					<div className="pressable-overview__features-item-description">
						{ translate(
							'You need reliability - we promise it. Our cloud-based architecture ensures success by making your site available all day, every day.'
						) }
					</div>
				</div>
			</div>
		</>
	);
}
