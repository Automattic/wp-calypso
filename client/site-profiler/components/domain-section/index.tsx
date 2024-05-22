import page from '@automattic/calypso-router';
import { useTranslate } from 'i18n-calypso';
import { UrlData } from 'calypso/blocks/import/types';
import DomainInformation from 'calypso/site-profiler/components/domain-information';
import { MetricsSection } from 'calypso/site-profiler/components/metrics-section';
import type { HostingProvider, WhoIs } from 'calypso/data/site-profiler/types';

interface DomainSectionProps {
	domain: string;
	whois: WhoIs;
	hostingProvider?: HostingProvider;
	urlData?: UrlData;
	domainRef: React.RefObject< HTMLObjectElement >;
}

export const DomainSection: React.FC< DomainSectionProps > = ( props ) => {
	const translate = useTranslate();
	const { domain, whois, hostingProvider, urlData, domainRef } = props;
	const { is_wpcom: isWPcom } = urlData?.platform_data || {};
	const goToDomainsPage = () => {
		if ( isWPcom ) {
			page( '/setup/domain-transfer' );
		}
	};

	return (
		<MetricsSection
			name={ translate( 'Domain' ) }
			title={
				isWPcom
					? translate(
							"Your domain {{success}}set up is excelent{{/success}}, contributing positively to your site's visibility and growth.",
							{
								components: {
									success: <span className="success" />,
								},
							}
					  )
					: translate(
							"Your domain {{success}}set up is good{{/success}}, but you could boost your site's visibility and growth.",
							{
								components: {
									success: <span className="success" />,
								},
							}
					  )
			}
			subtitle={ ! isWPcom ? translate( 'Optimize your domain' ) : undefined }
			subtitleOnClick={ goToDomainsPage }
			ref={ domainRef }
		>
			<DomainInformation
				domain={ domain }
				whois={ whois }
				hostingProvider={ hostingProvider }
				urlData={ urlData }
				hideTitle
			/>
		</MetricsSection>
	);
};
