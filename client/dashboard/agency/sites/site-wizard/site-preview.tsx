import { decodeEntities } from '@wordpress/html-entities';
import { __, sprintf } from '@wordpress/i18n';
import { useState } from 'react';
import SiteScreenshot from '../../components/site-screenshot';
import useSiteDiscovery from './use-site-discovery';
import type { IntakeSite } from './site-intake';
import type { Site } from '@automattic/api-core';

export default function SitePreview( {
	site,
	labelFor,
	simulate = false,
	knownSite,
	status,
	size = 'compact',
}: {
	site: IntakeSite;
	labelFor?: string;
	simulate?: boolean;
	knownSite?: Site;
	status?: string;
	size?: 'compact' | 'large';
} ) {
	const [ expanded, setExpanded ] = useState( false );
	const { container, visible, reserved, analysis, hosting, dns } = useSiteDiscovery(
		site.url,
		expanded
	);
	const sample = simulate && reserved;
	const domain = new URL( site.url ).hostname;
	const title =
		site.name === domain ? decodeEntities( analysis.data?.meta?.title || site.name ) : site.name;
	const provider = hosting.data?.hosting_provider;
	const platformData = analysis.data?.platform_data;
	const sampleHost = [ 'WordPress.com', 'Pressable', 'WP Engine' ][ site.id.length % 3 ];
	let host = provider?.slug !== 'unknown' ? provider?.name : undefined;
	if ( platformData?.is_pressable ) {
		host = 'Pressable';
	} else if ( platformData?.is_wpcom ) {
		host = 'WordPress.com';
	} else if ( platformData?.is_wpengine ) {
		host = 'WP Engine';
	}
	if ( sample ) {
		host = sampleHost;
	}
	const isNetwork =
		! platformData?.is_wpcom &&
		! platformData?.is_pressable &&
		! platformData?.is_wpengine &&
		provider?.is_cdn;
	const platform = sample ? 'wordpress' : analysis.data?.platform;
	const platformName = platform === 'wordpress' ? 'WordPress' : platform;
	let privacy: string = __( 'Unknown until connected' );
	if ( knownSite?.is_private === true ) {
		privacy = __( 'Private' );
	} else if ( knownSite?.is_coming_soon === true ) {
		privacy = __( 'Coming soon' );
	} else if ( knownSite?.is_private === false ) {
		privacy = __( 'Public' );
	}
	if ( sample ) {
		privacy = site.staging ? __( 'Private' ) : __( 'Public' );
	}
	const records = dns.data?.dns ?? [];
	const nameservers = sample
		? 'ns1.example.net, ns2.example.net'
		: records
				.filter( ( record ) => record.type === 'NS' )
				.map( ( record ) => record.target )
				.filter( Boolean )
				.join( ', ' );
	const addresses = sample
		? '192.0.2.10'
		: records
				.filter( ( record ) => record.type === 'A' || record.type === 'AAAA' )
				.map( ( record ) => record.ip || record.ipv6 )
				.filter( Boolean )
				.join( ', ' );
	const checking = analysis.isFetching || hosting.isFetching;

	return (
		<div className="agency-site-wizard__site-preview" data-size={ size } ref={ container }>
			<div className="agency-site-wizard__site-shot">
				{ reserved ? (
					<div className="agency-site-wizard__sample-shot" aria-hidden="true">
						<span />
						<span />
						<span />
					</div>
				) : (
					visible && (
						<SiteScreenshot
							key={ site.url }
							url={ site.url }
							alt=""
							compact={ size === 'compact' }
						/>
					)
				) }
			</div>
			<div className="agency-site-wizard__site-info">
				{ labelFor ? (
					<label className="agency-site-wizard__site-title" htmlFor={ labelFor }>
						{ title }
					</label>
				) : (
					<strong className="agency-site-wizard__site-title">{ title }</strong>
				) }
				{ title !== site.url.replace( /^https?:\/\//, '' ) && (
					<bdi className="agency-site-wizard__site-url">
						{ site.url.replace( /^https?:\/\//, '' ) }
					</bdi>
				) }
				<div className="agency-site-wizard__site-facts">
					{ platformName && platformName !== 'unknown' && <span>{ platformName }</span> }
					{ host && (
						<span>
							{ isNetwork
								? sprintf(
										/* translators: %s is a content delivery network. */
										__( 'Network: %s' ),
										host
									)
								: host }
						</span>
					) }
					{ checking && <span>{ __( 'Checking site…' ) }</span> }
					{ status && <span className="agency-site-wizard__site-status">{ status }</span> }
					{ sample && (
						<span className="agency-site-wizard__site-status">{ __( 'Sample data' ) }</span>
					) }
				</div>
				<details
					className="agency-site-wizard__site-details"
					onToggle={ ( event ) => setExpanded( event.currentTarget.open ) }
				>
					<summary>{ __( 'Site details' ) }</summary>
					<dl>
						<dt>{ isNetwork ? __( 'Network detected' ) : __( 'Hosting detected' ) }</dt>
						<dd>
							{ host || ( checking ? __( 'Checking…' ) : __( 'Couldn’t identify the host' ) ) }
						</dd>
						<dt>{ __( 'Privacy' ) }</dt>
						<dd>{ privacy }</dd>
						<dt>{ __( 'Nameservers' ) }</dt>
						<dd>
							<bdi>
								{ nameservers || ( dns.isFetching ? __( 'Checking…' ) : __( 'Unavailable' ) ) }
							</bdi>
						</dd>
						<dt>{ __( 'IP addresses' ) }</dt>
						<dd>
							<bdi>
								{ addresses || ( dns.isFetching ? __( 'Checking…' ) : __( 'Unavailable' ) ) }
							</bdi>
						</dd>
					</dl>
					{ isNetwork && (
						<p>{ __( 'A network or CDN can hide the underlying hosting provider.' ) }</p>
					) }
				</details>
			</div>
		</div>
	);
}
