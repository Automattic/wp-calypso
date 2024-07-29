import { translate } from 'i18n-calypso';
import { UrlData } from 'calypso/blocks/import/types';
import InfoPopover from 'calypso/components/info-popover';
import useHostingProviderName from 'calypso/site-profiler/hooks/use-hosting-provider-name';
import useHostingProviderURL from 'calypso/site-profiler/hooks/use-hosting-provider-url';
import VerifiedProvider from '../verified-provider';
import HostingPopupContent from './popup-inline-content';
import type { HostingProvider } from 'calypso/data/site-profiler/types';

interface Props {
	hostingProvider?: HostingProvider;
	urlData?: UrlData;
}

export default function HostingProviderName( props: Props ) {
	const { hostingProvider, urlData } = props;
	const isPopularCdn = ! urlData?.platform_data?.name && !! hostingProvider?.is_cdn;
	const hostingProviderName = useHostingProviderName( hostingProvider, urlData );
	const hostingProviderHomepage = useHostingProviderURL( 'homepage', hostingProvider, urlData );
	const hostingProviderLogin = useHostingProviderURL( 'login', hostingProvider, urlData );

	const NonA8cHostingName = () => {
		const nameComponent = hostingProvider?.homepage_url ? (
			<a href={ hostingProviderHomepage } target="_blank" rel="nofollow noreferrer">
				{ hostingProviderName }
			</a>
		) : (
			hostingProviderName
		);

		return (
			<>
				{ nameComponent }
				{ urlData?.platform === 'wordpress' && (
					<>
						&nbsp;&nbsp;
						<a href={ hostingProviderLogin } target="_blank" rel="nofollow noreferrer">
							({ translate( 'login' ) })
						</a>
					</>
				) }
				{ isPopularCdn && (
					<InfoPopover className="hosting-provider-name__tooltip" position="top">
						<HostingPopupContent hostingProvider={ hostingProvider } />
					</InfoPopover>
				) }
			</>
		);
	};

	return (
		<div className="hosting-provider-name__container">
			{ hostingProvider?.slug !== 'automattic' && <NonA8cHostingName /> }
			{ hostingProvider?.slug === 'automattic' && (
				<VerifiedProvider
					hostingProvider={ hostingProvider }
					urlData={ urlData }
					showHostingProvider
				/>
			) }
		</div>
	);
}
