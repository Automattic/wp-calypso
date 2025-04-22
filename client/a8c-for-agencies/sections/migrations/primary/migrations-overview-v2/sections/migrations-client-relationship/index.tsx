import { numberFormat, useTranslate } from 'i18n-calypso';
import HostingBenefitsSection from 'calypso/a8c-for-agencies/sections/marketplace/common/hosting-benefits-section';

import './style.scss';

export default function MigrationsClientRelationship() {
	const translate = useTranslate();
	return (
		<HostingBenefitsSection
			className="migrations-client-relationship"
			heading={ translate( 'Improve your client relationships with our hosting' ) }
			description={ translate( 'Our hosting platform is built exclusively for WordPress.' ) }
			items={ [
				{
					title: translate( 'Create trust' ),
					description: translate(
						"With over 15 years of experience running hundreds of millions of sites on WordPress.com, including the highest-trafficked sites globally, we've developed a platform we confidently put up against any cloud service."
					),
					benefits: [
						translate( '%(uptimePercent)s Uptime', {
							args: {
								uptimePercent: numberFormat( 0.99999, {
									numberFormatOptions: { style: 'percent', maximumFractionDigits: 3 },
								} ),
							},
							comment: '99.999% uptime',
						} ),
						translate( 'High availability with automated scaling' ),
					],
				},
				{
					title: translate( 'Minimize risk' ),
					description: translate(
						'Automattic hosting plans offer exceptional security from day one, with the option to include or sell additional client-facing security features like real-time backups, anti-spam, and malware scanning.'
					),
					benefits: [ translate( 'Web Application Firewall' ), translate( 'DDoS protection' ) ],
				},
				{
					title: translate( 'Increase speed' ),
					description: translate(
						"We're the only cloud platform team fully dedicated to optimizing WordPress. Your customers will feel the difference."
					),
					benefits: [
						translate( 'Incredibly low page speed index' ),
						'Automated WordPress edge caching',
					],
				},
			] }
		/>
	);
}
