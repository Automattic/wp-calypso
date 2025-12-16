import {
	type DomainConnectionSetupModeValue,
	DomainConnectionSetupMode,
	DomainMappingStatus,
} from '@automattic/api-core';
import { createElement, createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { isSubdomain } from '../../utils/domain';
import {
	StepType,
	StepName,
	StepNameValue,
	ProgressStepList,
	DomainTransferStepsMap,
} from './types';

export const getProgressStepList = (
	mode: DomainConnectionSetupModeValue,
	stepsDefinition: DomainTransferStepsMap
): ProgressStepList => {
	const modeSteps = Object.fromEntries(
		Object.entries( stepsDefinition ).filter(
			( [ , pageDefinition ] ) => pageDefinition.mode === mode
		)
	);

	let step = Object.values( modeSteps ).find(
		( pageDefinition ) => pageDefinition.stepType === StepType.START
	);

	const stepList = [];
	while ( step?.next ) {
		const found = Object.entries( modeSteps ).find( ( [ slug ] ) => slug === step?.next );

		if ( ! found ) {
			break;
		}

		const [ nextSlug, nextStep ] = found;
		stepList.push( [ nextSlug, nextStep.name ] );

		step = nextStep;
	}

	return Object.fromEntries( stepList );
};

export function isMappingVerificationSuccess(
	mode: DomainConnectionSetupModeValue | null,
	verificationStatus: DomainMappingStatus | undefined
) {
	if ( ! verificationStatus || ! mode ) {
		return false;
	}

	const {
		has_wpcom_nameservers: hasWpcomNameservers,
		has_wpcom_ip_addresses: hasWpcomIpAddresses,
		has_cloudflare_ip_addresses: hasCloudflareIpAddresses,
		resolves_to_wpcom: resolvesToWpcom,
	} = verificationStatus || {};

	if ( DomainConnectionSetupMode.SUGGESTED === mode && hasWpcomNameservers ) {
		return true;
	}

	if ( DomainConnectionSetupMode.ADVANCED === mode && hasWpcomIpAddresses ) {
		return true;
	}

	return !! ( hasCloudflareIpAddresses && resolvesToWpcom );
}

export const resolveStepName = (
	connectionMode: DomainConnectionSetupModeValue | null,
	supportsDomainConnect: boolean,
	domainName: string,
	initialStep: StepNameValue,
	firstStep: StepNameValue // default step
): StepNameValue => {
	if ( initialStep ) {
		return initialStep as StepNameValue;
	}
	// If connectionMode is present we'll send you to the last step of the relevant flow
	if ( connectionMode ) {
		if ( isSubdomain( domainName ) ) {
			return connectionMode === DomainConnectionSetupMode.ADVANCED
				? StepName.SUBDOMAIN_ADVANCED_UPDATE
				: StepName.SUBDOMAIN_SUGGESTED_UPDATE;
		}
		if ( connectionMode === DomainConnectionSetupMode.ADVANCED ) {
			return StepName.ADVANCED_UPDATE;
		} else if ( connectionMode === DomainConnectionSetupMode.DC ) {
			return StepName.DC_START;
		}
		return StepName.SUGGESTED_UPDATE;
	}
	// If connectionMode is not present we'll send you to one of the start steps
	if ( supportsDomainConnect ) {
		return StepName.DC_START;
	}
	return firstStep;
};

export function getMappingVerificationErrorMessage(
	mode: DomainConnectionSetupModeValue,
	verificationStatus: DomainMappingStatus | undefined
) {
	if ( ! verificationStatus ) {
		return;
	}

	if ( isMappingVerificationSuccess( mode, verificationStatus ) ) {
		return;
	}

	const {
		has_wpcom_nameservers: hasWpcomNameservers,
		has_wpcom_ip_addresses: hasWpcomIpAddresses,
		has_cloudflare_ip_addresses: hasCloudflareIpAddresses,
		resolves_to_wpcom: resolvesToWpcom,
		host_ip_addresses: hostIpAddresses,
		name_servers: nameServers,
	} = verificationStatus || {};

	const genericError = __( 'We couldn’t verify the connection for your domain, please try again.' );

	// if ( error ) {
	// 	return error?.message || genericError;
	// }

	if ( DomainConnectionSetupMode.SUGGESTED === mode && ! hasWpcomNameservers ) {
		if ( nameServers.length === 0 ) {
			return __( 'We couldn’t retrieve the name servers for your domain. Please try again.' );
		}

		return createInterpolateElement(
			/* translators: <nameservers/>: the list of name servers. (Ex.: "ns1.example, ns2.example.com") */
			__(
				'The name servers for your domain are set to: <nameservers/>. Please try this step again.'
			),
			{ nameservers: createElement( 'em', null, nameServers.join( ', ' ) ) }
		);
	}

	if ( DomainConnectionSetupMode.ADVANCED === mode && ! hasWpcomIpAddresses ) {
		if ( hostIpAddresses.length === 0 ) {
			return __( 'We couldn’t find any A records for your domain. Please try again.' );
		}

		return createInterpolateElement(
			/* translators: <ipaddresses/>: the list of IP addresses. (Ex.: "192.168.0.1, 192.168.0.2") */
			__( 'The A records for your domain are set to: <ipaddresses/>. Please try this step again.' ),
			{ ipaddresses: createElement( 'em', null, hostIpAddresses.join( ', ' ) ) }
		);
	}

	if ( hasCloudflareIpAddresses && ! resolvesToWpcom ) {
		return __(
			'Your domain appears to be set up with Cloudflare, but does not resolve to WordPress.com'
		);
	}

	return genericError;
}
