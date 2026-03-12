import { recordTracksEvent } from '@automattic/calypso-analytics';
import config from '@automattic/calypso-config';
import { localizeUrl } from '@automattic/i18n-utils';
import { createInterpolateElement } from '@wordpress/element';
import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
import wooLogo from 'calypso/assets/images/icons/Woo_logo_color.svg';
import { isCiabOAuth2Client } from 'calypso/lib/oauth2-clients';
import { useSelector } from 'calypso/state';
import { getCurrentOAuth2Client } from 'calypso/state/oauth2-clients/ui/selectors';
import getCurrentQueryArguments from 'calypso/state/selectors/get-current-query-arguments';
import getInitialQueryArguments from 'calypso/state/selectors/get-initial-query-arguments';
import type {
	AllowedSocialService,
	SignupAllowedService,
} from 'calypso/components/social-buttons/utils';

/**
 * Logo configuration
 */
interface LogoConfig {
	src: string;
	alt: string;
	width?: number;
	height?: number;
}

/**
 * CIAB Partner configuration
 * All partner-specific settings are centralized here
 */
export interface CiabPartnerConfig {
	/** Partner identifier */
	id: string;
	/** Display name shown in UI (e.g., "Woo") */
	displayName: string;
	/** Feature flag to enable/disable this partner */
	featureFlag: string;
	/** Logo configuration */
	logo: LogoConfig;
	/** Compact logo for TopBar (falls back to logo if not provided) */
	compactLogo?: LogoConfig;
	/** SSO providers to show (in order). Others will be hidden. */
	ssoProviders: SignupAllowedService[];
	/** Font style identifier for login/signup headings */
	fontStyle?: 'system';
	/** Domains that identify this partner in redirect URLs (e.g., ['my.woo.ai']) */
	domains?: string[];
	/** Callback to check if an OAuth2 client belongs to this partner */
	isOAuth2Client?: ( oauth2Client: { id: number } | null ) => boolean;
}

/**
 * CIAB Partners Configuration
 *
 * To add a new partner:
 * 1. Add entry here with all config
 * 2. Add the translated ToS text in getPartnerSignupTosElement() below (required for i18n extraction)
 * 3. Add feature flag to config/_shared.json and config/development.json
 * 4. Done! No other code changes needed.
 */
export const CIAB_PARTNERS: Record< string, CiabPartnerConfig > = {
	woo: {
		id: 'woo',
		displayName: 'Woo',
		featureFlag: 'ciab/custom-branding',
		logo: {
			src: wooLogo,
			alt: 'Woo',
			width: 72,
			height: 24,
		},
		compactLogo: {
			src: wooLogo,
			alt: 'Woo',
			width: 72,
			height: 24,
		},
		ssoProviders: [ 'paypal', 'google', 'apple', 'magic-login' ],
		fontStyle: 'system',
		domains: [ 'my.woo.ai', 'my.woo.localhost' ],
		isOAuth2Client: isCiabOAuth2Client,
	},
};

const CIAB_PARTNER_SESSION_KEY = 'calypso.ciab.partner-id';

function getSessionStorage(): Storage | null {
	if ( typeof window === 'undefined' ) {
		return null;
	}

	try {
		return window.sessionStorage;
	} catch {
		return null;
	}
}

export function readPersistedCiabPartnerId(): string | null {
	const sessionStorage = getSessionStorage();

	if ( ! sessionStorage ) {
		return null;
	}

	try {
		return sessionStorage.getItem( CIAB_PARTNER_SESSION_KEY );
	} catch {
		return null;
	}
}

export function persistCiabPartnerId( partnerId: string ): void {
	const sessionStorage = getSessionStorage();

	if ( ! sessionStorage || ! partnerId ) {
		return;
	}

	try {
		sessionStorage.setItem( CIAB_PARTNER_SESSION_KEY, partnerId );
	} catch {
		// Ignore storage write failures.
	}
}

export function clearPersistedCiabPartnerId(): void {
	const sessionStorage = getSessionStorage();

	if ( ! sessionStorage ) {
		return;
	}

	try {
		sessionStorage.removeItem( CIAB_PARTNER_SESSION_KEY );
	} catch {
		// Ignore storage clear failures.
	}
}

/**
 * Get CIAB partner config from garden info
 * Maps garden partner/name combinations to CIAB branding configs
 */
export function getCiabConfigFromGarden(
	gardenPartner?: string,
	gardenName?: string,
	options: { persistToSession?: boolean } = {}
): CiabPartnerConfig | null {
	if ( ! gardenPartner || ! gardenName ) {
		return null;
	}

	let ciabConfig: CiabPartnerConfig | null = null;

	// Map garden partners to branding configs
	if ( gardenPartner === 'woo' && gardenName === 'commerce' ) {
		ciabConfig = CIAB_PARTNERS.woo ?? null;
	}

	if ( ciabConfig && options.persistToSession ) {
		persistCiabPartnerId( ciabConfig.id );
	}

	// Future: add mappings for other partners like "paypal"
	return ciabConfig;
}

/**
 * Get CIAB partner config by matching a hostname against partner domains.
 */
function getCiabConfigByHostname( hostname: string ): CiabPartnerConfig | null {
	for ( const partnerConfig of Object.values( CIAB_PARTNERS ) ) {
		if ( partnerConfig.domains?.includes( hostname ) ) {
			if ( config.isEnabled( partnerConfig.featureFlag ) ) {
				return partnerConfig;
			}
		}
	}
	return null;
}

/**
 * Get CIAB partner config by matching the current page's hostname against partner domains.
 */
export function getCiabConfigFromCurrentDomain(): CiabPartnerConfig | null {
	if ( typeof window === 'undefined' ) {
		return null;
	}
	return getCiabConfigByHostname( window.location.hostname );
}

/**
 * Get CIAB partner config from the branding code query parameter.
 *
 * TODO: The `from` parameter is transitional — it provides backward compatibility
 * with existing flows (e.g. ?from=woo). In a follow-up, replace it with a dedicated
 * global branding-code parameter (e.g. ?branding=woo) and remove this fallback.
 */
export function getCiabConfigFromBrandingCode(): CiabPartnerConfig | null {
	if ( typeof window === 'undefined' ) {
		return null;
	}

	const params = new URLSearchParams( window.location.search );
	const from = params.get( 'from' );

	if ( from && CIAB_PARTNERS[ from ] ) {
		const partnerConfig = CIAB_PARTNERS[ from ];
		if ( config.isEnabled( partnerConfig.featureFlag ) ) {
			return partnerConfig;
		}
	}

	return null;
}

/**
 * Get CIAB partner config by matching a redirect URL's hostname against partner domains.
 */
export function getCiabConfigFromRedirectUrl(
	redirectUrl: string | string[] | undefined | null
): CiabPartnerConfig | null {
	const urlValue = Array.isArray( redirectUrl ) ? redirectUrl[ 0 ] : redirectUrl;

	if ( ! urlValue ) {
		return null;
	}

	try {
		return getCiabConfigByHostname( new URL( urlValue ).hostname );
	} catch {
		// Invalid URL, ignore
	}

	return null;
}

/**
 * Get CIAB partner config by matching an OAuth2 client (from Redux store) against partner configs.
 */
export function getCiabConfigFromOAuth2Client(
	oauth2Client: { id: number } | null | undefined
): CiabPartnerConfig | null {
	if ( ! oauth2Client ) {
		return null;
	}

	for ( const partnerConfig of Object.values( CIAB_PARTNERS ) ) {
		if ( partnerConfig.isOAuth2Client?.( oauth2Client ) ) {
			if ( config.isEnabled( partnerConfig.featureFlag ) ) {
				return partnerConfig;
			}
		}
	}

	return null;
}

/**
 * Read a query parameter from the current URL.
 */
function getSearchParam( name: string ): string | null {
	if ( typeof window === 'undefined' ) {
		return null;
	}
	return new URLSearchParams( window.location.search ).get( name );
}

/**
 * Detect CIAB partner config from globally available values.
 *
 * The oauth2Client parameter comes from Redux (getCurrentOAuth2Client).
 * Other detection sources read from window.location internally.
 *
 * Detection precedence (first match wins):
 *   1. hostname           — window.location.hostname against partner domains
 *   2. branding code      — ?from= query param (transitional, see getCiabConfigFromBrandingCode)
 *   3. OAuth2 client      — current OAuth2 client from Redux store matched against partner configs
 *   4. redirect_to        — hostname inside ?redirect_to= URL
 *   5. session storage    — persisted partner from a previous detection in this session
 */
export function detectCiabConfig( oauth2Client?: { id: number } | null ): CiabPartnerConfig | null {
	const detected =
		getCiabConfigFromCurrentDomain() ??
		getCiabConfigFromBrandingCode() ??
		getCiabConfigFromOAuth2Client( oauth2Client ) ??
		getCiabConfigFromRedirectUrl( getSearchParam( 'redirect_to' ) );

	if ( detected ) {
		persistCiabPartnerId( detected.id );
		return detected;
	}

	// Session persistence fallback: if no detection source matches,
	// check if a partner was previously detected in this session.
	const persistedPartnerId = readPersistedCiabPartnerId();

	if ( persistedPartnerId ) {
		const persistedConfig = CIAB_PARTNERS[ persistedPartnerId ];

		if ( persistedConfig && config.isEnabled( persistedConfig.featureFlag ) ) {
			return persistedConfig;
		}

		clearPersistedCiabPartnerId();
	}

	return null;
}

/**
 * Get allowed social services for a partner.
 * Detects partner from globally available values (see detectCiabConfig).
 * Returns the array of allowed SSO providers or null if no restrictions apply.
 * @returns Array of allowed service names (e.g., ['paypal', 'google', 'apple']) or null
 */
export function getPartnerAllowedSocialServices(
	oauth2Client?: { id: number } | null
): AllowedSocialService[] | null {
	const ciabConfig = detectCiabConfig( oauth2Client );
	return ciabConfig?.ssoProviders ?? null;
}

/**
 * Hook result
 */
export interface UsePartnerBrandingResult {
	/** Whether custom branding is active */
	hasCustomBranding: boolean;
	/** CIAB partner config (null if not a CIAB partner or feature flag disabled) */
	ciabConfig: CiabPartnerConfig | null;
	/** Ready-to-use logo element for TopBar, or undefined to use default */
	topBarLogo: JSX.Element | undefined;
	/** Ready-to-use ToS element for signup, or undefined to use default */
	signupTosElement: JSX.Element | undefined;
}

/**
 * Hook to get current partner branding based on URL params and feature flags.
 * Internally calls detectCiabConfig() — callers do not need to pass any values.
 *
 * @example
 * const { topBarLogo, ciabConfig, signupTosElement } = usePartnerBranding();
 *
 * // In TopBar:
 * <Step.TopBar logo={topBarLogo} ... />
 *
 * // For SSO filtering:
 * if (ciabConfig) {
 *   const allowedProviders = ciabConfig.ssoProviders;
 * }
 *
 * // For signup ToS:
 * if (signupTosElement) {
 *   return signupTosElement;
 * }
 */
export function usePartnerBranding(): UsePartnerBrandingResult {
	const translate = useTranslate();

	// Redux selectors are used only as memo-invalidation triggers.
	// The actual detection reads from window.location via detectCiabConfig().
	const currentQuery = useSelector( getCurrentQueryArguments );
	const initialQuery = useSelector( getInitialQueryArguments );
	const from = currentQuery?.from || initialQuery?.from;
	const redirectTo = currentQuery?.redirect_to || initialQuery?.redirect_to;
	const oauth2Client = useSelector( getCurrentOAuth2Client );

	return useMemo( () => {
		const ciabConfig = detectCiabConfig( oauth2Client );
		const hasCustomBranding = ciabConfig !== null;

		// Build logo element for TopBar
		const logoConfig = ciabConfig?.compactLogo ?? ciabConfig?.logo;
		const topBarLogo =
			hasCustomBranding && logoConfig?.src ? (
				<img
					src={ logoConfig.src }
					alt={ logoConfig.alt }
					width={ logoConfig.width }
					height={ logoConfig.height }
				/>
			) : undefined;

		// Build ToS element for signup
		const signupTosElement = getPartnerSignupTosElement( ciabConfig, translate );

		return {
			hasCustomBranding,
			ciabConfig,
			topBarLogo,
			signupTosElement,
		};
	}, [ from, redirectTo, oauth2Client, translate ] );
}

/**
 * Get the signup ToS element for a partner.
 * Each partner's ToS text must be a string literal for i18n extraction.
 */
export function getPartnerSignupTosElement(
	ciabConfig: CiabPartnerConfig | null,
	translate: ReturnType< typeof useTranslate >
): JSX.Element | undefined {
	if ( ! ciabConfig ) {
		return undefined;
	}

	const linkComponents = {
		tosLink: (
			<a
				href={ localizeUrl( 'https://wordpress.com/tos/' ) }
				onClick={ () => recordTracksEvent( 'calypso_signup_tos_link_click' ) }
				target="_blank"
				rel="noopener noreferrer"
			/>
		),
		privacyLink: (
			<a
				href={ localizeUrl( 'https://automattic.com/privacy/' ) }
				onClick={ () => recordTracksEvent( 'calypso_signup_privacy_link_click' ) }
				target="_blank"
				rel="noopener noreferrer"
			/>
		),
	};

	// Each partner's ToS text - must be string literals for i18n
	switch ( ciabConfig.id ) {
		case 'woo':
			return createInterpolateElement(
				translate(
					'Just a little reminder that by continuing with any of the options below, you agree to our <tosLink>Terms of Service</tosLink> and <privacyLink>Privacy Policy</privacyLink>. WordPress.com is used to manage your account.'
				),
				linkComponents
			);
		default:
			return undefined;
	}
}
