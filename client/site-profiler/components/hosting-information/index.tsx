import { localizeUrl } from '@automattic/i18n-utils';
import { DNS, HostingProvider } from 'calypso/data/site-profiler/types';

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
					<div className="name">Provider</div>
					<div>
						{ hostingProvider?.slug !== 'automattic' && <>{ hostingProvider?.name }</> }
						{ hostingProvider?.slug === 'automattic' && (
							<>
								<a href={ localizeUrl( 'https://automattic.com' ) }>{ hostingProvider?.name }</a>
								&nbsp;&nbsp;
								<a href={ localizeUrl( 'https://automattic.com/login' ) }>(login)</a>
							</>
						) }
					</div>
				</li>
				{ hostingProvider?.slug === 'automattic' && (
					<li>
						<div className="name">Support</div>
						<div>
							<a href={ localizeUrl( 'https://wordpress.com/help/contact' ) }>Contact support</a>
						</div>
					</li>
				) }
				<li>
					<div className="name">A Records</div>
					<div>
						<ul>
							{ aRecordIps.map( ( x, i ) => (
								<li key={ i }>{ x.ip }</li>
							) ) }
						</ul>
					</div>
				</li>
			</ul>
		</div>
	);
}
