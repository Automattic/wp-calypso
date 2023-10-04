import { recordTracksEvent } from '@automattic/calypso-analytics';
import { translate } from 'i18n-calypso';
import { useEffect } from 'react';
import { UrlData } from 'calypso/blocks/import/types';
import useHostingProviderURL from 'calypso/site-profiler/hooks/use-hosting-provider-url';
import HostingProviderName from './hosting-provider-name';
import type { DNS, HostingProvider } from 'calypso/data/site-profiler/types';
import './style.scss';

interface Props {
	dns: DNS[];
	urlData?: UrlData;
	hostingProvider?: HostingProvider;
}

export default function HostingInformation( props: Props ) {
	const { dns = [], urlData, hostingProvider } = props;
	const aRecordIps = dns.filter( ( x ) => x.type === 'A' && x.ip );
	const supportUrl = useHostingProviderURL( 'support', hostingProvider, urlData );

	useEffect( () => {
		hostingProvider &&
			recordTracksEvent( 'calypso_site_profiler_hosting_information', {
				is_cdn: hostingProvider?.is_cdn,
				provider_slug: hostingProvider?.slug,
				provider_name: hostingProvider?.name,
			} );
	}, [ hostingProvider ] );

	useEffect( () => {
		urlData &&
			recordTracksEvent( 'calypso_site_profiler_hosting_information', {
				domain_url: urlData?.url,
				platform: urlData?.platform,
				platform_slug: urlData?.platform_data?.slug,
				platform_is_wpcom: urlData?.platform_data?.is_wpcom,
				platform_is_wpengine: urlData?.platform_data?.is_wpengine,
				platform_is_pressable: urlData?.platform_data?.is_pressable,
			} );
	}, [ urlData ] );

	return (
		<div className="hosting-information">
			<h3>{ translate( 'Hosting information' ) }</h3>
			<ul className="hosting-information-details result-list">
				<li>
					<div className="name">{ translate( 'Provider' ) }</div>
					<HostingProviderName hostingProvider={ hostingProvider } urlData={ urlData } />
				</li>
				{ supportUrl && (
					<li>
						<div className="name">{ translate( 'Support' ) }</div>
						<div>
							<a href={ supportUrl }>{ translate( 'Contact support' ) }</a>
						</div>
					</li>
				) }
				<li className="a-records">
					<div className="name">
						{
							/* translators: "A Records" refer to the DNS records of type "A". */
							translate( 'A Records' )
						}
					</div>
					<div className="col">
						<ul>
							{ aRecordIps.map( ( x, i ) => (
								<li key={ i }>
									{ ! x.ip && '-' }
									{ x.ip && `${ x.ip }` }
								</li>
							) ) }
						</ul>
					</div>
					<div className="col">
						<ul>
							{ aRecordIps.map( ( x, i ) => (
								<li key={ i }>
									{ ! x.host && '-' }
									{ x.host && `${ x.host }` }
								</li>
							) ) }
						</ul>
					</div>
				</li>
			</ul>
		</div>
	);
}
