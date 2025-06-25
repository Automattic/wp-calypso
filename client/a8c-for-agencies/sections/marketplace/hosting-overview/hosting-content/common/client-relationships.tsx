import { formatNumber } from '@automattic/number-formatters';
import { useTranslate } from 'i18n-calypso';
import { SectionBackground } from 'calypso/a8c-for-agencies/components/page-section/backgrounds';
import HostingBenefitsSection from '../../../common/hosting-benefits-section';

type Props = {
	background?: SectionBackground;
};

export default function ClientRelationships( { background }: Props ) {
	const translate = useTranslate();
	return (
		<HostingBenefitsSection
			heading={ translate( 'Improve your client relationships with our hosting' ) }
			subheading={ translate( 'How Automattic can help' ) }
			background={ background }
			items={ [
				{
					title: translate( 'Create trust' ),
					description: translate(
						"With over 15 years of experience running hundreds of millions of sites on WordPress.com, including the highest-trafficked sites globally, we've developed a platform we confidently put up against any cloud service."
					),
					benefits: [
						translate( '%(uptimePercent)s Uptime', {
							args: {
								uptimePercent: formatNumber( 0.99999, {
									numberFormatOptions: { style: 'percent', maximumFractionDigits: 3 },
								} ),
							},
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
