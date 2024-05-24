import { useTranslate } from 'i18n-calypso';
import HostingInformation from 'calypso/site-profiler/components/hosting-information';
import { MetricsSection } from 'calypso/site-profiler/components/metrics-section';
import { getTitleTranslateOptions } from 'calypso/site-profiler/utils/get-title-translate-options';
import type { UrlData } from 'calypso/blocks/import/types';
import type { DNS, HostingProvider } from 'calypso/data/site-profiler/types';

interface HostingSectionProps {
	dns: DNS[];
	urlData?: UrlData;
	hostingProvider?: HostingProvider;
	hostingRef: React.RefObject< HTMLObjectElement >;
	openMigrationForm?: () => void;
}

export const HostingSection: React.FC< HostingSectionProps > = ( props ) => {
	const translate = useTranslate();
	const { dns = [], urlData, hostingProvider, hostingRef, openMigrationForm } = props;
	const isWPcom = hostingProvider?.slug?.toLowerCase() === 'automattic';

	return (
		<MetricsSection
			name={ translate( 'Hosting' ) }
			title={
				isWPcom
					? translate(
							'Your hosting {{good}}speed and uptime is excellent{{/good}}, providing a reliable and enjoyable user experience.',
							getTitleTranslateOptions()
					  )
					: translate(
							'Struggles with hosting {{poor}}speed and uptime{{/poor}} deter visitors. A switch to WordPress.com could transform the user experience.',
							getTitleTranslateOptions()
					  )
			}
			subtitle={ ! isWPcom ? translate( 'Upgrade your hosting with WordPress.com' ) : undefined }
			subtitleOnClick={ openMigrationForm }
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
