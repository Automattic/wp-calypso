import { useTranslate } from 'i18n-calypso';
import HostingInformation from 'calypso/site-profiler/components/hosting-information';
import { MetricsSection } from 'calypso/site-profiler/components/metrics-section';
import type { UrlData } from 'calypso/blocks/import/types';
import type { DNS, HostingProvider } from 'calypso/data/site-profiler/types';

interface HostingSectionProps {
	dns: DNS[];
	urlData?: UrlData;
	hostingProvider?: HostingProvider;
	hostingRef: React.RefObject< HTMLObjectElement >;
}

export const HostingSection: React.FC< HostingSectionProps > = ( props ) => {
	const translate = useTranslate();
	const { dns = [], urlData, hostingProvider, hostingRef } = props;
	const isWPcom = hostingProvider?.slug?.toLowerCase() === 'automattic';

	return (
		<MetricsSection
			name={ translate( 'Hosting' ) }
			title={
				isWPcom
					? translate(
							'Your hosting {{success}}speed and uptime{{/success}} is excellent, providing a reliable and enjoyable user experience.',
							{
								components: {
									success: <span className="success" />,
								},
							}
					  )
					: translate(
							'Struggles with hosting {{alert}}speed and uptime{{/alert}} deter visitors. A switch to WordPress.com could transform the user experience.',
							{
								components: {
									alert: <span className="alert" />,
								},
							}
					  )
			}
			subtitle={ translate( 'Upgrade your hosting with WordPress.com' ) }
			ref={ hostingRef }
		>
			<HostingInformation
				dns={ dns }
				urlData={ urlData }
				hostingProvider={ hostingProvider }
				hideTitle
			/>
		</MetricsSection>
	);
};
