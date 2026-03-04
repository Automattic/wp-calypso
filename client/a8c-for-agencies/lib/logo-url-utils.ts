import type { ReferralLogoChoice } from '../sections/marketplace/checkout/referral-logo';

/**
 * Converts a blob URL to a base64 data URL for use in email previews.
 * Blob URLs are browser-only and cannot be accessed by the backend.
 *
 * @param file - The File object to convert
 * @returns Promise that resolves to a data URL string
 */
export const convertBlobToDataUrl = ( file: File ): Promise< string > => {
	return new Promise( ( resolve, reject ) => {
		const reader = new FileReader();
		reader.onload = () => {
			if ( typeof reader.result === 'string' ) {
				resolve( reader.result );
			} else {
				reject( new Error( 'Failed to read file as data URL' ) );
			}
		};
		reader.onerror = () => reject( new Error( 'FileReader error' ) );
		reader.readAsDataURL( file );
	} );
};

/**
 * Gets the appropriate logo URL for email preview.
 * Converts blob URLs to data URLs, falls back to profile logo or agency referrals logo.
 *
 * @param referralLogo - The referral logo choice object
 * @param profileLogoUrl - The agency's profile logo URL
 * @returns Promise that resolves to the logo URL string or null
 */
export const getLogoUrlForPreview = async (
	referralLogo: ReferralLogoChoice,
	profileLogoUrl: string | null
): Promise< string | null > => {
	// Convert blob URL to data URL if a file is selected
	if ( referralLogo.file && referralLogo.logoUrl?.startsWith( 'blob:' ) ) {
		try {
			const dataUrl = await convertBlobToDataUrl( referralLogo.file );
			return dataUrl;
		} catch ( error ) {
			// Fallback to profile logo or null
			return referralLogo.option === 'profile' ? profileLogoUrl : null;
		}
	}
	// Use the logo URL directly (profile logo or agency referrals logo)
	return referralLogo.option === 'profile' ? profileLogoUrl : referralLogo.logoUrl;
};

/**
 * Derives a small, deterministic cache key for a logo URL.
 * For regular URLs we use the URL directly; for data URLs we use a short hash
 * instead of the full string to keep React Query keys compact.
 */
export const getLogoCacheKey = ( logoUrl?: string | null ): string | null => {
	if ( ! logoUrl ) {
		return null;
	}

	if ( ! logoUrl.startsWith( 'data:' ) ) {
		return logoUrl;
	}

	// Simple 32-bit hash to fingerprint the data URL.
	let hash = 5381;
	for ( let index = 0; index < logoUrl.length; index++ ) {
		hash = ( hash * 33 ) ^ logoUrl.charCodeAt( index );
	}

	return `inline-${ ( hash >>> 0 ).toString( 16 ) }`;
};
