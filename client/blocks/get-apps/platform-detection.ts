/**
 * Type definitions for User-Agent Client Hints API
 */
interface UADataValues {
	platform: string;
	architecture?: string;
	bitness?: string;
	platformVersion?: string;
}

interface NavigatorUAData {
	brands: ReadonlyArray< { brand: string; version: string } >;
	mobile: boolean;
	platform: string;
	getHighEntropyValues( hints: string[] ): Promise< UADataValues >;
}

declare global {
	interface Navigator {
		userAgentData?: NavigatorUAData;
	}
}

/**
 * Detects Windows architecture using User-Agent Client Hints API
 * Returns 'arm64', 'x64', or null if detection fails
 */
export const getWindowsArchitecture = async (): Promise< 'arm64' | 'x64' | null > => {
	// Check if User-Agent Client Hints API is available
	if ( 'userAgentData' in navigator && navigator.userAgentData ) {
		try {
			const uaData = await navigator.userAgentData.getHighEntropyValues( [
				'architecture',
				'bitness',
				'platform',
			] );

			// ARM64 detection
			if ( uaData.architecture === 'arm' || uaData.architecture === 'arm64' ) {
				return 'arm64';
			}

			// x64/x86 detection
			if ( uaData.architecture === 'x86' && uaData.bitness === '64' ) {
				return 'x64';
			}

			// Default to x64 for Windows if architecture is detected but doesn't match above
			if ( uaData.architecture ) {
				return 'x64';
			}

			return null;
		} catch ( error ) {
			// eslint-disable-next-line no-console
			console.warn( 'Failed to get high entropy values:', error );
			return null;
		}
	}

	return null; // API not available
};
