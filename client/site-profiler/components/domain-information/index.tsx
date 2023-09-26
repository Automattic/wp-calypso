import { Button } from '@wordpress/components';
import { createElement, createInterpolateElement } from '@wordpress/element';
import { translate } from 'i18n-calypso';
import { useState } from 'react';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import { useDomainAnalyzerWhoisRawDataQuery } from 'calypso/data/site-profiler/use-domain-whois-raw-data-query';
import VerifiedProvider from './verified-provider';
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
	const urlRegex = /https?:\/\/[^\s/$.?#].[^\s]*/g;
	const [ fetchWhoisRawData, setFetchWhoisRawData ] = useState( false );

	const {
		data: whoisRawData,
		isFetching: whoisRawDataFetching,
		isError: whoisRawDataFetchingError,
	} = useDomainAnalyzerWhoisRawDataQuery( domain, fetchWhoisRawData );

	const contactArgs = ( name: string ) => {
		return {
			args: [ name ],
			components: { strong: <strong /> },
		};
	};

	const linkifyUrlFromText = ( text: string ) => {
		let url = '';

		const preparedText = text.replace( urlRegex, ( _url: string ) => {
			url = _url;
			return '<a>link</a>';
		} );

		return createInterpolateElement( preparedText, {
			a: createElement( 'a', { href: url, target: '_blank', rel: 'nofollow noreferrer' } ),
		} );
	};

	return (
		<div className="domain-information">
			<h3>{ translate( 'Domain information' ) }</h3>

			<ul className="domain-information-details result-list">
				{ whois.domain_name && (
					<li>
						<div className="name">{ translate( 'Domain name' ) }</div>
						<div>{ whois.domain_name }</div>
					</li>
				) }
				{ whois.registrar && (
					<li>
						<div className="name">{ translate( 'Registrar' ) }</div>
						<div>
							{ whois.registrar_url?.toLowerCase().includes( 'automattic' ) && (
								<VerifiedProvider />
							) }
							{ ! whois.registrar_url?.toLowerCase().includes( 'automattic' ) && (
								<a href={ whois.registrar_url } target="_blank" rel="noopener noreferrer">
									{ whois.registrar }
								</a>
							) }
							{ ! whois.registrar_url && <span>{ whois.registrar }</span> }
						</div>
					</li>
				) }
				{ whois.creation_date && (
					<li>
						<div className="name">{ translate( 'Registered on' ) }</div>
						<div>{ moment.utc( whois.creation_date ).format( momentFormat ) }</div>
					</li>
				) }
				{ whois.registry_expiry_date && (
					<li>
						<div className="name">{ translate( 'Expires on' ) }</div>
						<div>{ moment.utc( whois.registry_expiry_date ).format( momentFormat ) }</div>
					</li>
				) }
				{ whois.updated_date && (
					<li>
						<div className="name">{ translate( 'Updated on' ) }</div>
						<div>{ moment.utc( whois.updated_date ).format( momentFormat ) }</div>
					</li>
				) }
				{ whois.name_server && (
					<li>
						<div className="name">{ translate( 'Name servers' ) }</div>
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
							<strong>{ translate( 'Registrant contact' ) }</strong>
						</h4>
						<ul>
							{ whois.registrant_name && (
								<li>
									{ translate(
										'{{strong}}Name:{{/strong}} %s',
										contactArgs( whois.registrant_name )
									) }
								</li>
							) }
							{ whois.registrant_organization && (
								<li>
									{ translate(
										'{{strong}}Organization:{{/strong}} %s',
										contactArgs( whois.registrant_organization )
									) }
								</li>
							) }
							{ whois.registrant_street && (
								<li>
									{ translate(
										'{{strong}}Street:{{/strong}} %s',
										contactArgs( whois.registrant_street )
									) }
								</li>
							) }
							{ whois.registrant_city && (
								<li>
									{ translate(
										'{{strong}}City:{{/strong}} %s',
										contactArgs( whois.registrant_city )
									) }
								</li>
							) }
							{ whois.registrant_state && (
								<li>
									{ translate(
										'{{strong}}State:{{/strong}} %s',
										contactArgs( whois.registrant_state )
									) }
								</li>
							) }
							{ whois.registrant_postal_code && (
								<li>
									{ translate(
										'{{strong}}Postal Code:{{/strong}} %s',
										contactArgs( whois.registrant_postal_code )
									) }
								</li>
							) }
							{ whois.registrant_country && (
								<li>
									{ translate(
										'{{strong}}Country:{{/strong}} %s',
										contactArgs( whois.registrant_country )
									) }
								</li>
							) }
							{ whois.registrant_phone && (
								<li>
									{ translate(
										'{{strong}}Phone:{{/strong}} %s',
										contactArgs( whois.registrant_phone )
									) }
								</li>
							) }
							{ whois.registrant_email && (
								<li>
									{ whois.registrant_email?.includes( '@' ) && (
										<a href={ `mailto:${ whois.registrant_email }` }>{ translate( 'Email' ) }</a>
									) }
									{ urlRegex.test( whois.registrant_email ) &&
										linkifyUrlFromText( whois.registrant_email ) }
								</li>
							) }
						</ul>
					</div>
					<div className="col">
						<h4>
							<strong>{ translate( 'Administrative contact' ) }</strong>
						</h4>
						<ul>
							{ whois.admin_name && (
								<li>
									{ translate( '{{strong}}Name:{{/strong}} %s', contactArgs( whois.admin_name ) ) }
								</li>
							) }
							{ whois.admin_organization && (
								<li>
									{ translate(
										'{{strong}}Organization:{{/strong}} %s',
										contactArgs( whois.admin_organization )
									) }
								</li>
							) }
							{ whois.admin_street && (
								<li>
									{ translate(
										'{{strong}}Street:{{/strong}} %s',
										contactArgs( whois.admin_street )
									) }
								</li>
							) }
							{ whois.admin_city && (
								<li>
									{ translate( '{{strong}}City:{{/strong}} %s', contactArgs( whois.admin_city ) ) }
								</li>
							) }
							{ whois.admin_state && (
								<li>
									{ translate(
										'{{strong}}State:{{/strong}} %s',
										contactArgs( whois.admin_state )
									) }
								</li>
							) }
							{ whois.admin_postal_code && (
								<li>
									{ translate(
										'{{strong}}Postal Code:{{/strong}} %s',
										contactArgs( whois.admin_postal_code )
									) }
								</li>
							) }
							{ whois.admin_country && (
								<li>
									{ translate(
										'{{strong}}Country:{{/strong}} %s',
										contactArgs( whois.admin_country )
									) }
								</li>
							) }
							{ whois.admin_phone && (
								<li>
									{ translate(
										'{{strong}}Phone:{{/strong}} %s',
										contactArgs( whois.admin_phone )
									) }
								</li>
							) }
							{ whois.admin_email?.includes( '@' ) && (
								<a href={ `mailto:${ whois.admin_email }` }>{ translate( 'Email' ) }</a>
							) }
							{ whois.admin_email &&
								urlRegex.test( whois.admin_email ) &&
								linkifyUrlFromText( whois.admin_email ) }
						</ul>
					</div>
					<div className="col">
						<h4>
							<strong>{ translate( 'Technical contact' ) }</strong>
						</h4>
						<ul>
							{ whois.tech_name && (
								<li>
									{ translate( '{{strong}}Name:{{/strong}} %s', contactArgs( whois.tech_name ) ) }
								</li>
							) }
							{ whois.tech_organization && (
								<li>
									{ translate(
										'{{strong}}Organization:{{/strong}} %s',
										contactArgs( whois.tech_organization )
									) }
								</li>
							) }
							{ whois.tech_street && (
								<li>
									{ translate(
										'{{strong}}Street:{{/strong}} %s',
										contactArgs( whois.tech_street )
									) }
								</li>
							) }
							{ whois.tech_city && (
								<li>
									{ translate( '{{strong}}City:{{/strong}} %s', contactArgs( whois.tech_city ) ) }
								</li>
							) }
							{ whois.tech_state && (
								<li>
									{ translate( '{{strong}}State:{{/strong}} %s', contactArgs( whois.tech_state ) ) }
								</li>
							) }
							{ whois.tech_postal_code && (
								<li>
									{ translate(
										'{{strong}}Postal Code:{{/strong}} %s',
										contactArgs( whois.tech_postal_code )
									) }
								</li>
							) }
							{ whois.tech_country && (
								<li>
									{ translate(
										'{{strong}}Country:{{/strong}} %s',
										contactArgs( whois.tech_country )
									) }
								</li>
							) }
							{ whois.tech_phone && (
								<li>
									{ translate( '{{strong}}Phone:{{/strong}} %s', contactArgs( whois.tech_phone ) ) }
								</li>
							) }
							{ whois.tech_email?.includes( '@' ) && (
								<a href={ `mailto:${ whois.tech_email }` }>{ translate( 'Email' ) }</a>
							) }
							{ whois.tech_email &&
								urlRegex.test( whois.tech_email ) &&
								linkifyUrlFromText( whois.tech_email ) }
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
								{ translate( 'Display raw WHOIS output' ) }
							</Button>
						) }

						{ whoisRawDataFetchingError && (
							<p>{ translate( 'Error fetching WHOIS data; please try again later.' ) }</p>
						) }

						{ whoisRawData && (
							<div className="whois-raw-data">
								<p>
									{ translate(
										'This WHOIS data is provided for information purposes ' +
											'for domains registered through WordPress.com. We ' +
											'do not guarantee its accuracy. This information ' +
											'is shown for the sole purpose of assisting you in ' +
											'obtaining information about domain name registration ' +
											'records; any use of this data for any other purpose ' +
											'is expressly forbidden.'
									) }
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
