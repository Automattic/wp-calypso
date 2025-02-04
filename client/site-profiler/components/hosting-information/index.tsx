import { translate } from 'i18n-calypso';
import useHostingProviderURL from 'calypso/site-profiler/hooks/use-hosting-provider-url';
import HostingProviderName from './hosting-provider-name';
import type { UrlData } from 'calypso/blocks/import/types';
import type { DNS, HostingProvider } from 'calypso/data/site-profiler/types';
import './style.scss';

interface Props {
	dns: DNS[];
	urlData?: UrlData;
	hostingProvider?: HostingProvider;
	hideTitle?: boolean;
}

export default function HostingInformation( props: Props ) {
	const { dns = [], urlData, hostingProvider, hideTitle = false } = props;
	const aRecordIps = dns.filter( ( x ) => x.type === 'A' && x.ip );
	const supportUrl = useHostingProviderURL( 'support', hostingProvider, urlData );

	return (
		<div className="hosting-information">
			{ ! hideTitle && <h3>{ translate( 'Hosting information' ) }</h3> }
			<ul className="hosting-information-details result-list">
				<li>
					<div className="name">{ translate( 'Provider' ) }</div>
					<HostingProviderName hostingProvider={ hostingProvider } urlData={ urlData } />
				</li>
				{ supportUrl && (
					<li>
						<div className="name">{ translate( 'Support' ) }</div>
						<div>
							<a href={ supportUrl } target="_blank" rel="nofollow noreferrer">
								{ translate( 'Contact support' ) }
							</a>
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
