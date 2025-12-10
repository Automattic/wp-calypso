import { DomainConnectionSetupMode } from '@automattic/api-core';
import './dns-propagation-progress-bar-style.scss';
import {
	ProgressBar,
	__experimentalHStack as HStack,
	__experimentalText as Text,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import type { DomainMappingSetupInfo, DomainMappingStatus } from '@automattic/api-core';

interface Props {
	domainMappingStatus: DomainMappingStatus;
	domainConnectionSetupInfo: DomainMappingSetupInfo;
}

/**
 * Calculates the progress percentage based on comparing current values with expected values.
 * @param currentValues - Current values (name servers or IP addresses)
 * @param expectedValues - Expected values to match against
 * @returns Progress percentage (0-100)
 */
function calculateProgress( currentValues: string[], expectedValues: string[] ): number {
	// Normalize values to lowercase for comparison
	const normalizedCurrent = currentValues.map( ( value ) => value.toLowerCase() );
	const normalizedExpected = expectedValues.map( ( value ) => value.toLowerCase() );

	// Create a Set for efficient lookup
	const currentSet = new Set( normalizedCurrent );

	// Count how many expected values are present in current values
	const matchedCount = normalizedExpected.filter( ( expected ) =>
		currentSet.has( expected )
	).length;

	// Calculate percentage based on how many expected values are matched
	const totalExpected = normalizedExpected.length;
	return totalExpected > 0 ? Math.round( ( matchedCount / totalExpected ) * 100 ) : 0;
}

export default function DnsPropagationProgressBar( {
	domainMappingStatus,
	domainConnectionSetupInfo,
}: Props ) {
	const mode = domainMappingStatus.mode;
	let progressPercentage = 0;

	if ( mode === DomainConnectionSetupMode.SUGGESTED ) {
		const currentNameServers = domainMappingStatus.name_servers || [];
		const expectedNameServers = domainConnectionSetupInfo.wpcom_name_servers || [];
		progressPercentage = calculateProgress( currentNameServers, expectedNameServers );
	} else if (
		mode === DomainConnectionSetupMode.ADVANCED ||
		mode === DomainConnectionSetupMode.DC
	) {
		const currentIpAddresses = domainMappingStatus.host_ip_addresses || [];
		const expectedIpAddresses = domainConnectionSetupInfo.default_ip_addresses || [];
		progressPercentage = calculateProgress( currentIpAddresses, expectedIpAddresses );
	} else {
		// All other cases: 0%
		progressPercentage = 0;
	}

	return (
		<VStack spacing={ 2 }>
			<HStack justify="space-between">
				<Text weight={ 500 }>{ __( 'Progress' ) }</Text>
				<Text>{ progressPercentage }%</Text>
			</HStack>
			<ProgressBar className="dns-propagation-progress-bar" value={ progressPercentage } />
		</VStack>
	);
}
