import type { ReferralLogoPayload } from '@automattic/api-core';

/** Which logo the referral email carries. */
export type ReferralLogo =
	| { type: 'profile'; url: string }
	| { type: 'last'; url: string }
	| { type: 'file'; file: File; previewUrl: string }
	| { type: 'none' };

/** Opens on the profile logo, else the last referral logo, else nothing. */
export function getInitialReferralLogo(
	profileLogoUrl: string | null | undefined,
	lastReferralLogoUrl: string | null | undefined
): ReferralLogo {
	if ( profileLogoUrl ) {
		return { type: 'profile', url: profileLogoUrl };
	}
	if ( lastReferralLogoUrl ) {
		return { type: 'last', url: lastReferralLogoUrl };
	}
	return { type: 'none' };
}

/** The `logo_type` Tracks property, in classic's vocabulary. */
export function getReferralLogoOption( logo: ReferralLogo ): 'profile' | 'different' | 'none' {
	switch ( logo.type ) {
		case 'profile':
			return 'profile';
		case 'none':
			return 'none';
		default:
			return 'different';
	}
}

/**
 * The logo payload of the request, once a picked file has been uploaded to
 * `uploadedUrl`.
 */
export function getReferralLogoPayload(
	logo: ReferralLogo,
	uploadedUrl?: string
): ReferralLogoPayload {
	switch ( logo.type ) {
		case 'profile':
			return { type: 'profile' };
		case 'last':
			return { type: 'custom', url: logo.url };
		case 'file':
			return uploadedUrl ? { type: 'custom', url: uploadedUrl } : { type: 'none' };
		default:
			return { type: 'none' };
	}
}

const readAsDataUrl = ( file: File ) =>
	new Promise< string >( ( resolve, reject ) => {
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

/**
 * The logo URL the email preview can render: a picked file becomes a data
 * URL, since the server cannot read a blob URL.
 */
export async function getReferralLogoPreviewUrl(
	logo: ReferralLogo
): Promise< string | undefined > {
	switch ( logo.type ) {
		case 'profile':
		case 'last':
			return logo.url;
		case 'file':
			try {
				return await readAsDataUrl( logo.file );
			} catch {
				return undefined;
			}
		default:
			return undefined;
	}
}
