/**
 * External dependencies
 */
import { createElement, createInterpolateElement } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
/**
 * Internal dependencies
 */
import { modeType } from 'calypso/components/domains/connect-domain-step/constants';

export function getMappingVerificationErrorMessage( mode, verificationStatus ) {
	const { data, error } = verificationStatus;

	if ( ! data && ! error ) {
		return;
	}

	if ( isMappingVerificationSuccess( mode, data ) ) {
		return;
	}

	const {
		has_wpcom_nameservers: hasWpcomNameservers,
		has_wpcom_ip_addresses: hasWpcomIpAddresses,
		has_cloudflare_ip_addresses: hasCloudflareIpAddresses,
		resolves_to_wpcom: resolvesToWpcom,
		host_ip_addresses: hostIpAddresses,
		name_servers: nameServers,
	} = data || {};

	const genericError = __( "We couldn't verify the connection for your domain, please try again." );

	if ( error ) {
		return error?.message || genericError;
	}

	if ( modeType.SUGGESTED === mode && ! hasWpcomNameservers ) {
		if ( nameServers.length === 0 ) {
			return __( "We couldn't retrieve the name servers for your domain. Please try again." );
		}

		return createInterpolateElement(
			sprintf(
				/* translators: %s: the list of name servers. (Ex.: "ns1.example, ns2.example.com") */
				__(
					'The name servers for your domain are set to: <em>%s</em>. Please try this step again.'
				),
				nameServers.join( ', ' )
			),
			{ em: createElement( 'em' ) }
		);
	}

	if ( modeType.ADVANCED === mode && ! hasWpcomIpAddresses ) {
		if ( hostIpAddresses.length === 0 ) {
			return __( "We couldn't find any A records for your domain. Please try again." );
		}

		return createInterpolateElement(
			sprintf(
				/* translators: %s: the list of IP addresses. (Ex.: "192.168.0.1, 192.168.0.2") */
				__( 'The A records for your domain are set to: <em>%s</em>. Please try this step again.' ),
				hostIpAddresses.join( ', ' )
			),
			{ em: createElement( 'em' ) }
		);
	}

	if ( hasCloudflareIpAddresses && ! resolvesToWpcom ) {
		return __(
			'Your domain appears to be set up with Cloudflare, but does not resolve to WordPress.com'
		);
	}

	return genericError;
}

export function isMappingVerificationSuccess( mode, verificationStatus ) {
	if ( Object.keys( verificationStatus ).length === 0 ) {
		return false;
	}

	const {
		has_wpcom_nameservers: hasWpcomNameservers,
		has_wpcom_ip_addresses: hasWpcomIpAddresses,
		has_cloudflare_ip_addresses: hasCloudflareIpAddresses,
		resolves_to_wpcom: resolvesToWpcom,
	} = verificationStatus || {};

	if ( modeType.SUGGESTED === mode && hasWpcomNameservers ) {
		return true;
	}

	if ( modeType.ADVANCED === mode && hasWpcomIpAddresses ) {
		return true;
	}

	return !! ( hasCloudflareIpAddresses && resolvesToWpcom );
}
