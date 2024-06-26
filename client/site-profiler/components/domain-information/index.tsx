import { recordTracksEvent } from '@automattic/calypso-analytics';
import { Button } from '@wordpress/components';
import { createElement, createInterpolateElement } from '@wordpress/element';
import { TranslateOptions, translate } from 'i18n-calypso';
import { useEffect, useState } from 'react';
import { UrlData } from 'calypso/blocks/import/types';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import { useDomainAnalyzerWhoisRawDataQuery } from 'calypso/data/site-profiler/use-domain-whois-raw-data-query';
import { useFilteredWhoisData } from 'calypso/site-profiler/hooks/use-filtered-whois-data';
import { normalizeWhoisField } from 'calypso/site-profiler/utils/normalize-whois-entry';
import { normalizeWhoisList } from 'calypso/site-profiler/utils/normalize-whois-list';
import { normalizeWhoisURL } from 'calypso/site-profiler/utils/normalize-whois-url';
import VerifiedProvider from '../verified-provider';
import type { HostingProvider, WhoIs } from 'calypso/data/site-profiler/types';
import './styles.scss';

interface Props {
	domain: string;
	whois: WhoIs;
	hostingProvider?: HostingProvider;
	urlData?: UrlData;
	hideTitle?: boolean;
}

export default function DomainInformation( props: Props ) {
	const { domain, whois, hostingProvider, urlData, hideTitle = false } = props;
	const moment = useLocalizedMoment();
	const momentFormat = 'YYYY-MM-DD HH:mm:ss UTC';
	const urlRegex = /https?:\/\/[^\s/$.?#].[^\s]*/g;
	const [ fetchWhoisRawData, setFetchWhoisRawData ] = useState( false );

	const {
		data: whoisRawData,
		isFetching: whoisRawDataFetching,
		isError: whoisRawDataFetchingError,
	} = useDomainAnalyzerWhoisRawDataQuery( domain, fetchWhoisRawData );

	const whoisDataAvailability = whois && Object.keys( whois ).length > 0;
	const { fieldsRedacted, filteredWhois } = useFilteredWhoisData( whois );

	useEffect( () => {
		fetchWhoisRawData &&
			recordTracksEvent( 'calypso_site_profiler_domain_whois_raw_data_fetch', { domain } );
	}, [ domain, fetchWhoisRawData ] );

	const contactArgs = ( args?: string | string[] ): TranslateOptions => {
		return {
			args,
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

	const formatDateTime = ( date?: string | string[] ) => {
		const res = moment.utc( normalizeWhoisField( date ) );

		return res.isValid() ? res.format( momentFormat ) : '';
	};

	return (
		<div className="domain-information">
			{ ! hideTitle && <h3>{ translate( 'Domain information' ) }</h3> }

			<ul className="domain-information-details result-list">
				{ filteredWhois.domain_name && (
					<li>
						<div className="name">{ translate( 'Domain name' ) }</div>
						<div>{ normalizeWhoisField( whois.domain_name ) }</div>
					</li>
				) }
				{ filteredWhois.registrar && (
					<li>
						<div className="name">{ translate( 'Registrar' ) }</div>
						<div>
							{ normalizeWhoisURL( whois.registrar_url ).toLowerCase().includes( 'automattic' ) && (
								<VerifiedProvider
									hostingProvider={ hostingProvider }
									urlData={ urlData }
									showHostingProvider={ false }
								/>
							) }
							{ whois.registrar_url &&
								! normalizeWhoisURL( whois.registrar_url )
									.toLowerCase()
									.includes( 'automattic' ) && (
									<a
										href={ normalizeWhoisURL( whois.registrar_url ) }
										target="_blank"
										rel="noopener noreferrer"
									>
										{ normalizeWhoisField( whois.registrar ) }
									</a>
								) }
							{ ! whois.registrar_url && <span>{ normalizeWhoisField( whois.registrar ) }</span> }
						</div>
					</li>
				) }
				{ filteredWhois.creation_date && (
					<li>
						<div className="name">{ translate( 'Registered on' ) }</div>
						<div>{ formatDateTime( whois.creation_date ) }</div>
					</li>
				) }
				{ filteredWhois.registry_expiry_date && (
					<li>
						<div className="name">{ translate( 'Expires on' ) }</div>
						<div>{ formatDateTime( whois.registry_expiry_date ) }</div>
					</li>
				) }
				{ filteredWhois.updated_date && (
					<li>
						<div className="name">{ translate( 'Updated on' ) }</div>
						<div>{ formatDateTime( whois.updated_date ) }</div>
					</li>
				) }
				{ filteredWhois.name_server && whois.name_server && (
					<li>
						<div className="name">{ translate( 'Name servers' ) }</div>
						<div>
							<ul>
								{ normalizeWhoisList( whois.name_server ).map( ( x, i ) => (
									<li key={ i }>{ x }</li>
								) ) }
							</ul>
						</div>
					</li>
				) }
				<li>
					<div className="name">{ translate( 'Contact' ) }</div>

					{ ! whoisDataAvailability && <div>{ translate( 'Not available' ) }</div> }

					{ whoisDataAvailability && (
						<>
							<div className="col">
								<h4>
									<strong>{ translate( 'Registrant contact' ) }</strong>
								</h4>
								<ul>
									{ filteredWhois.registrant_name && (
										<li>
											{ translate(
												'{{strong}}Name:{{/strong}} %s',
												contactArgs( whois.registrant_name )
											) }
										</li>
									) }
									{ filteredWhois.registrant_organization && (
										<li>
											{ translate(
												'{{strong}}Organization:{{/strong}} %s',
												contactArgs( whois.registrant_organization )
											) }
										</li>
									) }
									{ filteredWhois.registrant_street && (
										<li>
											{ translate(
												'{{strong}}Street:{{/strong}} %s',
												contactArgs( whois.registrant_street )
											) }
										</li>
									) }
									{ filteredWhois.registrant_city && (
										<li>
											{ translate(
												'{{strong}}City:{{/strong}} %s',
												contactArgs( whois.registrant_city )
											) }
										</li>
									) }
									{ filteredWhois.registrant_state && (
										<li>
											{ translate(
												'{{strong}}State:{{/strong}} %s',
												contactArgs( whois.registrant_state )
											) }
										</li>
									) }
									{ filteredWhois.registrant_postal_code && (
										<li>
											{ translate(
												'{{strong}}Postal Code:{{/strong}} %s',
												contactArgs( whois.registrant_postal_code )
											) }
										</li>
									) }
									{ filteredWhois.registrant_country && (
										<li>
											{ translate(
												'{{strong}}Country:{{/strong}} %s',
												contactArgs( whois.registrant_country )
											) }
										</li>
									) }
									{ filteredWhois.registrant_phone && (
										<li>
											{ translate(
												'{{strong}}Phone:{{/strong}} %s',
												contactArgs( whois.registrant_phone )
											) }
										</li>
									) }
									{ filteredWhois.registrant_email && whois.registrant_email && (
										<li>
											{ whois.registrant_email.includes( '@' ) && (
												<a href={ `mailto:${ whois.registrant_email }` }>
													{ translate( 'Email' ) }
												</a>
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
									{ filteredWhois.admin_name && (
										<li>
											{ translate(
												'{{strong}}Name:{{/strong}} %s',
												contactArgs( whois.admin_name )
											) }
										</li>
									) }
									{ filteredWhois.admin_organization && (
										<li>
											{ translate(
												'{{strong}}Organization:{{/strong}} %s',
												contactArgs( whois.admin_organization )
											) }
										</li>
									) }
									{ filteredWhois.admin_street && (
										<li>
											{ translate(
												'{{strong}}Street:{{/strong}} %s',
												contactArgs( whois.admin_street )
											) }
										</li>
									) }
									{ filteredWhois.admin_city && (
										<li>
											{ translate(
												'{{strong}}City:{{/strong}} %s',
												contactArgs( whois.admin_city )
											) }
										</li>
									) }
									{ filteredWhois.admin_state && (
										<li>
											{ translate(
												'{{strong}}State:{{/strong}} %s',
												contactArgs( whois.admin_state )
											) }
										</li>
									) }
									{ filteredWhois.admin_postal_code && (
										<li>
											{ translate(
												'{{strong}}Postal Code:{{/strong}} %s',
												contactArgs( whois.admin_postal_code )
											) }
										</li>
									) }
									{ filteredWhois.admin_country && (
										<li>
											{ translate(
												'{{strong}}Country:{{/strong}} %s',
												contactArgs( whois.admin_country )
											) }
										</li>
									) }
									{ filteredWhois.admin_phone && (
										<li>
											{ translate(
												'{{strong}}Phone:{{/strong}} %s',
												contactArgs( whois.admin_phone )
											) }
										</li>
									) }
									{ filteredWhois.admin_email && whois.admin_email?.includes( '@' ) && (
										<a href={ `mailto:${ whois.admin_email }` }>{ translate( 'Email' ) }</a>
									) }
									{ filteredWhois.admin_email &&
										whois.admin_email &&
										urlRegex.test( whois.admin_email ) &&
										linkifyUrlFromText( whois.admin_email ) }
								</ul>
							</div>
							<div className="col">
								<h4>
									<strong>{ translate( 'Technical contact' ) }</strong>
								</h4>
								<ul>
									{ filteredWhois.tech_name && (
										<li>
											{ translate(
												'{{strong}}Name:{{/strong}} %s',
												contactArgs( whois.tech_name )
											) }
										</li>
									) }
									{ filteredWhois.tech_organization && (
										<li>
											{ translate(
												'{{strong}}Organization:{{/strong}} %s',
												contactArgs( whois.tech_organization )
											) }
										</li>
									) }
									{ filteredWhois.tech_street && (
										<li>
											{ translate(
												'{{strong}}Street:{{/strong}} %s',
												contactArgs( whois.tech_street )
											) }
										</li>
									) }
									{ filteredWhois.tech_city && (
										<li>
											{ translate(
												'{{strong}}City:{{/strong}} %s',
												contactArgs( whois.tech_city )
											) }
										</li>
									) }
									{ filteredWhois.tech_state && (
										<li>
											{ translate(
												'{{strong}}State:{{/strong}} %s',
												contactArgs( whois.tech_state )
											) }
										</li>
									) }
									{ filteredWhois.tech_postal_code && (
										<li>
											{ translate(
												'{{strong}}Postal Code:{{/strong}} %s',
												contactArgs( whois.tech_postal_code )
											) }
										</li>
									) }
									{ filteredWhois.tech_country && (
										<li>
											{ translate(
												'{{strong}}Country:{{/strong}} %s',
												contactArgs( whois.tech_country )
											) }
										</li>
									) }
									{ filteredWhois.tech_phone && (
										<li>
											{ translate(
												'{{strong}}Phone:{{/strong}} %s',
												contactArgs( whois.tech_phone )
											) }
										</li>
									) }
									{ filteredWhois.tech_email && whois.tech_email?.includes( '@' ) && (
										<a href={ `mailto:${ whois.tech_email }` }>{ translate( 'Email' ) }</a>
									) }
									{ filteredWhois.tech_email &&
										whois.tech_email &&
										urlRegex.test( whois.tech_email ) &&
										linkifyUrlFromText( whois.tech_email ) }
								</ul>
							</div>
						</>
					) }
				</li>
				{ whoisDataAvailability && fieldsRedacted > 0 && (
					<li className="redacted">
						<div className="name"></div>
						<div>{ translate( '* Some fields have been redacted for privacy' ) }</div>
					</li>
				) }
				<li>
					<div className="name">WhoIs</div>
					{ ! whoisDataAvailability && <div>{ translate( 'Not available' ) }</div> }

					{ whoisDataAvailability && (
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
					) }
				</li>
			</ul>
		</div>
	);
}
