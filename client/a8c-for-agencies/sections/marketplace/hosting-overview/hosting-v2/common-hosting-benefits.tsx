import { useTranslate } from 'i18n-calypso';
import HostingBenefitsSection from '../../common/hosting-benefits-section';
import { BackgroundType3 } from '../../common/hosting-section/backgrounds';

export default function CommonHostingBenefits() {
	const translate = useTranslate();
	return (
		<HostingBenefitsSection
			heading={ translate( 'Improve your client relationships with our hosting' ) }
			subheading={ translate( 'How can Automattic help' ) }
			background={ BackgroundType3 }
			items={ [
				{
					title: translate( 'Create trust' ),
					description: translate(
						"With over 15 years of experience running hundreds of millions of sites on WordPress.com, including the highest-trafficked sites globally, we've developed a platform we confidently put up against any cloud service."
					),
					benefits: [
						translate( '99.999% Uptime' ),
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
