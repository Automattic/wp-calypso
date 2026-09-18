import { getQueryArg } from '@wordpress/url';

// The WordPress and Jetpack mobile apps share the same OAuth2 client IDs; the app
// identity is not encoded in the client_id. Distinguish the Jetpack app from the
// WordPress app by the redirect_uri scheme (jetpack:// vs wordpress://).
// Keep these in sync with wpcom `.config/constants.php`.
const IOS_APP_OAUTH2_CLIENT_IDS = [ 11, 29217, 36118, 55461 ];
const ANDROID_APP_OAUTH2_CLIENT_IDS = [ 2697, 55462 ];

export const isAkismetOAuth2Client = ( oauth2Client ) => {
	return oauth2Client?.id === 973;
};

export const isAndroidOAuth2Client = ( oauth2Client ) => {
	return !! oauth2Client && ANDROID_APP_OAUTH2_CLIENT_IDS.includes( oauth2Client.id );
};

export const isIosOAuth2Client = ( oauth2Client ) => {
	return !! oauth2Client && IOS_APP_OAUTH2_CLIENT_IDS.includes( oauth2Client.id );
};

// True for either mobile app (WordPress or Jetpack) on either platform.
export const isSharedMobileAppOAuth2Client = ( oauth2Client ) => {
	return isIosOAuth2Client( oauth2Client ) || isAndroidOAuth2Client( oauth2Client );
};

export const isCrowdsignalOAuth2Client = ( oauth2Client ) => {
	return oauth2Client?.id === 978;
};

export const isWPJobManagerOAuth2Client = ( oauth2Client ) => {
	return oauth2Client?.id === 90057;
};

export const isGravatarFlowOAuth2Client = ( oauth2Client ) => {
	return oauth2Client?.source === 'gravatar';
};

export const isGravatarOAuth2Client = ( oauth2Client ) => {
	return oauth2Client?.id === 1854 || isGravatarFlowOAuth2Client( oauth2Client );
};

// Gravatar flow clients owned by Gravatar, e.g., Gravatar iOS app, Gravatar Android app, etc.
export const isGravatarOwnedOAuth2Client = ( oauth2Client ) => {
	const isOwnedByGravatar = [ 119371, 119387 ].includes( oauth2Client?.id );

	return isGravatarFlowOAuth2Client( oauth2Client ) && isOwnedByGravatar;
};

export const isGravPoweredOAuth2Client = ( oauth2Client ) => {
	return isGravatarOAuth2Client( oauth2Client ) || isWPJobManagerOAuth2Client( oauth2Client );
};

export const isWooOAuth2Client = ( oauth2Client ) => {
	// 50019 => WooCommerce Dev, 50915 => WooCommerce Staging, 50916 => WooCommerce Production.
	return oauth2Client && [ 50019, 50915, 50916 ].includes( oauth2Client.id );
};

export const isBlazeProOAuth2Client = ( oauth2Client ) => {
	// 92099 => Blaze Pro Dev, 99370 => Blaze Pro Staging, 98166 => Blaze Pro Production.
	return oauth2Client && [ 98166, 92099, 99370 ].includes( oauth2Client.id );
};

export const isJetpackCloudOAuth2Client = ( oauth2Client ) => {
	// 68663 => Jetpack Cloud Dev,
	return oauth2Client && [ 68663, 69040, 69041 ].includes( oauth2Client.id );
};

export const isA4AOAuth2Client = ( oauth2Client ) => {
	// 68663 => Automattic for Agencies Dev,
	return oauth2Client && [ 95928, 95931, 95932 ].includes( oauth2Client.id );
};

export const isIntenseDebateOAuth2Client = ( oauth2Client ) => {
	return oauth2Client?.id === 2665;
};

export const isStudioAppOAuth2Client = ( oauth2Client ) => {
	// 95109 => Studio by WordPress.com.
	return oauth2Client?.id === 95109;
};

export const isPartnerPortalOAuth2Client = ( oauth2Client ) => {
	return oauth2Client && [ 102832, 103914 ].includes( oauth2Client.id );
};

export const isVIPOAuth2Client = ( oauth2Client ) => {
	return oauth2Client?.id === 76596;
};

export const isCiabOAuth2Client = ( oauth2Client ) => {
	// 134404 => CIAB Dev, 134405 => CIAB Staging/Production.
	return oauth2Client && [ 134404, 134405 ].includes( oauth2Client.id );
};

const JETPACK_APP_URI_SCHEME = 'jetpack://';

// The redirect_uri reaches the login page nested inside redirect_to, where it is
// often multiply percent-encoded (e.g. `jetpack%253A%252F%252F...`). Decode until
// the value stops changing so the scheme is legible.
const fullyDecode = ( value ) => {
	let decoded = String( value );
	for ( let i = 0; i < 5; i++ ) {
		let next;
		try {
			next = decodeURIComponent( decoded );
		} catch {
			return decoded;
		}
		if ( next === decoded ) {
			break;
		}
		decoded = next;
	}
	return decoded;
};

// Reads the app's OAuth2 callback (redirect_uri) out of a login query. It is
// nested inside redirect_to, but may also appear as a direct query param.
export const getOAuth2RedirectUri = ( query ) => {
	if ( ! query ) {
		return null;
	}
	if ( typeof query.redirect_uri === 'string' ) {
		return query.redirect_uri;
	}
	if ( typeof query.redirect_to !== 'string' ) {
		return null;
	}
	const redirectUri = getQueryArg( query.redirect_to, 'redirect_uri' );
	return typeof redirectUri === 'string' ? redirectUri : null;
};

export const isJetpackAppRedirectUri = ( redirectUri ) => {
	return (
		typeof redirectUri === 'string' &&
		fullyDecode( redirectUri ).toLowerCase().startsWith( JETPACK_APP_URI_SCHEME )
	);
};
