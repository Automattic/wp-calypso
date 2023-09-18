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
					<div>{ hostingProvider?.name }</div>
				</li>
				<li>
					<div className="name">Support</div>
					<div>Contact support</div>
				</li>
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
