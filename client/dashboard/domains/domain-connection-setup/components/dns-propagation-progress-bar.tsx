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
 * Calculates the progress percentage based on name server comparison.
 * @param currentNameServers - Current name servers from domainMappingStatus
 * @param expectedNameServers - Expected name servers from domainConnectionSetupInfo
 * @returns Progress percentage (0-100)
 */
function calculateProgress( currentNameServers: string[], expectedNameServers: string[] ): number {
	// Normalize name servers to lowercase for comparison
	const normalizedCurrent = currentNameServers.map( ( ns ) => ns.toLowerCase() );
	const normalizedExpected = expectedNameServers.map( ( ns ) => ns.toLowerCase() );

	// Create a Set for efficient lookup
	const currentSet = new Set( normalizedCurrent );

	// Count how many expected name servers are present in current name servers
	const matchedCount = normalizedExpected.filter( ( expected ) =>
		currentSet.has( expected )
	).length;

	// Calculate percentage based on how many expected name servers are matched
	const totalExpected = normalizedExpected.length;
	return totalExpected > 0 ? Math.round( ( matchedCount / totalExpected ) * 100 ) : 0;
}

export default function DnsPropagationProgressBar( {
	domainMappingStatus,
	domainConnectionSetupInfo,
}: Props ) {
	const mode = domainMappingStatus.mode;
	let progressPercentage = 0;

	if ( mode === DomainConnectionSetupMode.DC ) {
		progressPercentage = 100;
	} else if (
		mode === DomainConnectionSetupMode.SUGGESTED ||
		mode === DomainConnectionSetupMode.ADVANCED
	) {
		const currentNameServers = domainMappingStatus.name_servers || [];
		const expectedNameServers = domainConnectionSetupInfo.wpcom_name_servers || [];
		progressPercentage = calculateProgress( currentNameServers, expectedNameServers );
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
