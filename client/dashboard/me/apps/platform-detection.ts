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

export interface PlatformDetectionResult {
	platform: string;
	architecture?: 'arm64' | 'x64';
	detectionMethod: 'client-hints' | 'navigator-platform';
}

/**
 * Detects platform and architecture using User-Agent Client Hints API
 * Returns platform info with architecture if detected, or null if detection fails
 */
export const detectPlatformAndArchitecture =
	async (): Promise< PlatformDetectionResult | null > => {
		// Try User-Agent Client Hints API first (most reliable)
		if ( 'userAgentData' in navigator && navigator.userAgentData ) {
			try {
				const uaData = await navigator.userAgentData.getHighEntropyValues( [
					'architecture',
					'bitness',
					'platform',
				] );

				const platform = uaData.platform?.toLowerCase() || '';

				let architecture: 'arm64' | 'x64' | undefined;

				// Detect architecture for all platforms
				if ( uaData.architecture === 'arm' || uaData.architecture === 'arm64' ) {
					architecture = 'arm64';
				} else if ( uaData.architecture === 'x86' && uaData.bitness === '64' ) {
					architecture = 'x64';
				} else if ( uaData.architecture === 'x86' ) {
					architecture = 'x64'; // Assume x64 for x86 architecture
				}

				return {
					platform,
					architecture,
					detectionMethod: 'client-hints',
				};
			} catch ( error ) {
				// eslint-disable-next-line no-console
				console.warn( 'Failed to get high entropy values:', error );
			}
		}

		// Fallback to navigator.platform (unreliable, frozen in modern browsers)
		const platformName = navigator.platform.toLowerCase();

		if ( platformName.includes( 'mac' ) ) {
			return {
				platform: 'macos',
				architecture: undefined, // Cannot reliably detect Mac architecture
				detectionMethod: 'navigator-platform',
			};
		}

		if ( platformName.includes( 'linux' ) ) {
			return {
				platform: 'linux',
				architecture: undefined,
				detectionMethod: 'navigator-platform',
			};
		}

		if ( platformName.includes( 'win' ) ) {
			return {
				platform: 'windows',
				architecture: undefined, // Cannot detect Windows architecture without Client Hints
				detectionMethod: 'navigator-platform',
			};
		}

		return null; // Unable to detect platform
	};
