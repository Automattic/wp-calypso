import { localizeUrl } from '@automattic/i18n-utils';
import { translate } from 'i18n-calypso';
import VerifiedProvider from '../domain-information/verified-provider';
import type { DNS, HostingProvider } from 'calypso/data/site-profiler/types';

interface Props {
	dns: DNS[];
	hostingProvider?: HostingProvider;
}

export default function HostingInformation( props: Props ) {
	const { dns = [], hostingProvider } = props;
	const aRecordIps = dns.filter( ( x ) => x.type === 'A' && x.ip );

	return (
		<div className="hosting-information">
			<h3>Hosting information</h3>
			<ul className="hosting-information-details result-list">
				<li>
					<div className="name">{ translate( 'Provider' ) }</div>
					<div>
						{ hostingProvider?.slug !== 'automattic' && <>{ hostingProvider?.name }</> }
						{ hostingProvider?.slug === 'automattic' && <VerifiedProvider /> }
					</div>
				</li>
				{ hostingProvider?.slug === 'automattic' && (
					<li>
						<div className="name">Support</div>
						<div>
							<a href={ localizeUrl( 'https://wordpress.com/help/contact' ) }>
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
									{ ! x.host && '-' }
									{ x.host && `${ x.host }` }
								</li>
							) ) }
						</ul>
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
				</li>
			</ul>
		</div>
	);
}
