import { Button } from '@wordpress/components';
import { useState } from 'react';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import { useDomainAnalyzerWhoisRawDataQuery } from 'calypso/data/site-profiler/use-domain-whois-raw-data-query';
import type { WhoIs } from 'calypso/data/site-profiler/types';
import './styles.scss';

interface Props {
	domain: string;
	whois: WhoIs;
}

export default function DomainInformation( props: Props ) {
	const { domain, whois } = props;
	const moment = useLocalizedMoment();
	const momentFormat = 'YYYY-MM-DD HH:mm:ss UTC';
	const [ fetchWhoisRawData, setFetchWhoisRawData ] = useState( false );

	const {
		data: whoisRawData,
		isFetching: whoisRawDataFetching,
		isError: isFetchingError,
	} = useDomainAnalyzerWhoisRawDataQuery( domain, fetchWhoisRawData );

	return (
		<div className="domain-information">
			<h3>Domain information</h3>

			<ul className="domain-information-details">
				{ whois.registrar_url && (
					<li>
						<div className="name">Registrar</div>
						<div>
							<a href={ whois.registrar_url }>{ whois.registrar_url }</a>
						</div>
					</li>
				) }
				{ whois.creation_date && (
					<li>
						<div className="name">Registered on</div>
						<div>{ moment.utc( whois.creation_date ).format( momentFormat ) }</div>
					</li>
				) }
				{ whois.registry_expiry_date && (
					<li>
						<div className="name">Expires on</div>
						<div>{ moment.utc( whois.registry_expiry_date ).format( momentFormat ) }</div>
					</li>
				) }
				{ whois.updated_date && (
					<li>
						<div className="name">Updated on</div>
						<div>{ moment.utc( whois.updated_date ).format( momentFormat ) }</div>
					</li>
				) }
				{ whois.name_server && (
					<li>
						<div className="name">Name servers</div>
						<div>
							<ul>
								{ whois.name_server.map( ( x, i ) => (
									<li key={ i }>{ x }</li>
								) ) }
							</ul>
						</div>
					</li>
				) }
				<li>
					<div className="name">Contact</div>
					<div className="col">
						<h4>
							<strong>Registrant contact</strong>
						</h4>
						<ul>
							{ whois.registrant_name && (
								<li>
									<strong>Name:</strong> { whois.registrant_name }
								</li>
							) }
							{ whois.registrant_organization && (
								<li>
									<strong>Organization:</strong> { whois.registrant_organization }
								</li>
							) }
							{ whois.registrant_street && (
								<li>
									<strong>Street:</strong> { whois.registrant_street }
								</li>
							) }
							{ whois.registrant_city && (
								<li>
									<strong>City:</strong> { whois.registrant_city }
								</li>
							) }
							{ whois.registrant_state && (
								<li>
									<strong>State:</strong> { whois.registrant_state }
								</li>
							) }
							{ whois.registrant_postal_code && (
								<li>
									<strong>Postal Code:</strong> { whois.registrant_postal_code }
								</li>
							) }
							{ whois.registrant_country && (
								<li>
									<strong>Country:</strong> { whois.registrant_country }
								</li>
							) }
							{ whois.registrant_phone && (
								<li>
									<strong>Phone:</strong> { whois.registrant_phone }
								</li>
							) }
							{ whois.registrant_email && (
								<li>
									<a href={ `mailto:${ whois.registrant_email }` }>Email</a>
								</li>
							) }
						</ul>
					</div>
					<div className="col">
						<h4>
							<strong>Administrative contact</strong>
						</h4>
						<ul>
							{ whois.admin_name && (
								<li>
									<strong>Name:</strong> { whois.admin_name }
								</li>
							) }
							{ whois.admin_organization && (
								<li>
									<strong>Organization:</strong> { whois.admin_organization }
								</li>
							) }
							{ whois.admin_street && (
								<li>
									<strong>Street:</strong> { whois.admin_street }
								</li>
							) }
							{ whois.admin_city && (
								<li>
									<strong>City:</strong> { whois.admin_city }
								</li>
							) }
							{ whois.admin_state && (
								<li>
									<strong>State:</strong> { whois.admin_state }
								</li>
							) }
							{ whois.admin_postal_code && (
								<li>
									<strong>Postal Code:</strong> { whois.admin_postal_code }
								</li>
							) }
							{ whois.admin_country && (
								<li>
									<strong>Country:</strong> { whois.admin_country }
								</li>
							) }
							{ whois.admin_phone && (
								<li>
									<strong>Phone:</strong> { whois.admin_phone }
								</li>
							) }
							{ whois.admin_email && (
								<li>
									<a href={ `mailto:${ whois.admin_email }` }>Email</a>
								</li>
							) }
						</ul>
					</div>
					<div className="col">
						<h4>
							<strong>Technical contact</strong>
						</h4>
						<ul>
							{ whois.tech_name && (
								<li>
									<strong>Name:</strong> { whois.tech_name }
								</li>
							) }
							{ whois.tech_organization && (
								<li>
									<strong>Organization:</strong> { whois.tech_organization }
								</li>
							) }
							{ whois.tech_street && (
								<li>
									<strong>Street:</strong> { whois.tech_street }
								</li>
							) }
							{ whois.tech_city && (
								<li>
									<strong>City:</strong> { whois.tech_city }
								</li>
							) }
							{ whois.tech_state && (
								<li>
									<strong>State:</strong> { whois.tech_state }
								</li>
							) }
							{ whois.tech_postal_code && (
								<li>
									<strong>Postal Code:</strong> { whois.tech_postal_code }
								</li>
							) }
							{ whois.tech_country && (
								<li>
									<strong>Country:</strong> { whois.tech_country }
								</li>
							) }
							{ whois.tech_phone && (
								<li>
									<strong>Phone:</strong> { whois.tech_phone }
								</li>
							) }
							{ whois.tech_email && (
								<li>
									<a href={ `mailto:${ whois.tech_email }` }>Email</a>
								</li>
							) }
						</ul>
					</div>
				</li>
				<li>
					<div className="name">WhoIs</div>
					<div className="whois-raw-data">
						{ ! whoisRawData && (
							<Button
								isBusy={ whoisRawDataFetching }
								onClick={ () => setFetchWhoisRawData( true ) }
								variant="link"
							>
								Display raw WHOIS output
							</Button>
						) }

						{ isFetchingError && <p>Error fetching WHOIS data; please try again later.</p> }

						{ whoisRawData && (
							<div className="whois-raw-data">
								<p>
									This WHOIS data is provided for information purposes for domains registered
									through WordPress.com. We do not guarantee its accuracy. This information is shown
									for the sole purpose of assisting you in obtaining information about domain name
									registration records; any use of this data for any other purpose is expressly
									forbidden.
								</p>
								<pre>{ whoisRawData.whois.join( '\n' ) }</pre>
							</div>
						) }
					</div>
				</li>
			</ul>
		</div>
	);
}
