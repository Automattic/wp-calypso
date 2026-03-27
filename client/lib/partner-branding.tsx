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
import type React from 'react';

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
 * Partner configuration
 * All partner-specific settings are centralized here
 */
export interface PartnerConfig {
	/** Partner identifier */
	id: string;
	/** Display name shown in UI (e.g., "Woo") */
	displayName: string;
	/** Feature flag to enable/disable this partner. If omitted, the partner is always active. */
	featureFlag?: string;
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
	/** Window title suffix used on branded auth flows */
	windowTitleSuffix?: string;
}

/**
 * Partner configuration
 *
 * To add a new partner:
 * 1. Add entry here with all config.
 * 2. Add translated ToS text in getPartnerSignupTosElement() below (required for i18n extraction).
 * 3. Add the feature flag to config/_shared.json and config/development.json.
 * 4. Done. No other code changes are needed.
 */
export const PARTNERS: Record< string, PartnerConfig > = {
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
		windowTitleSuffix: 'Woo',
		domains: [ 'my.woo.ai', 'my.woo.localhost' ],
		isOAuth2Client: isCiabOAuth2Client,
	},
};

export function getPartnerWindowTitleSuffix( partnerConfig: PartnerConfig | null ): string {
	return partnerConfig?.windowTitleSuffix || config( 'site_name' );
}

export function getPartnerFormattedWindowTitle(
	title: string | null | undefined,
	partnerConfig: PartnerConfig | null
): string {
	const titlePrefix = title ? `${ title } — ` : '';

	return titlePrefix + getPartnerWindowTitleSuffix( partnerConfig );
}

export interface PartnerSsoCopy {
	title: React.ReactNode;
	subtitle: React.ReactNode;
	primaryLabel: React.ReactNode;
	secondaryLabel: React.ReactNode;
}

export function getPartnerSsoCopy(
	partnerConfig: PartnerConfig | null,
	translate: ReturnType< typeof useTranslate >,
	options: { defaultSubtitle: React.ReactNode }
): PartnerSsoCopy {
	if ( partnerConfig?.id === 'woo' ) {
		return {
			title: translate( 'Connect to Woo Shop' ),
			subtitle: translate( 'Give Woo Shop access to your WordPress.com account.' ),
			primaryLabel: translate( 'Connect' ),
			secondaryLabel: translate( 'Cancel' ),
		};
	}

	return {
		title: translate( 'Connect with WordPress.com' ),
		subtitle: options.defaultSubtitle,
		primaryLabel: translate( 'Log in' ),
		secondaryLabel: translate( 'Cancel' ),
	};
}

function isPartnerEnabled( partnerConfig: PartnerConfig ): boolean {
	return ! partnerConfig.featureFlag || config.isEnabled( partnerConfig.featureFlag );
}

const PARTNER_SESSION_KEY = 'calypso.partner.partner-id';
const LEGACY_PARTNER_SESSION_KEY = 'calypso.ciab.partner-id';

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

export function readPersistedPartnerId(): string | null {
	const sessionStorage = getSessionStorage();

	if ( ! sessionStorage ) {
		return null;
	}

	try {
		const partnerId = sessionStorage.getItem( PARTNER_SESSION_KEY );

		if ( partnerId ) {
			return partnerId;
		}

		const legacyPartnerId = sessionStorage.getItem( LEGACY_PARTNER_SESSION_KEY );

		if ( ! legacyPartnerId ) {
			return null;
		}

		// One-time migration: read from the legacy CIAB key and immediately
		// re-persist using the partner-generic key.
		sessionStorage.setItem( PARTNER_SESSION_KEY, legacyPartnerId );
		sessionStorage.removeItem( LEGACY_PARTNER_SESSION_KEY );

		return legacyPartnerId;
	} catch {
		return null;
	}
}

export function persistPartnerId( partnerId: string ): void {
	const sessionStorage = getSessionStorage();

	if ( ! sessionStorage || ! partnerId ) {
		return;
	}

	try {
		sessionStorage.setItem( PARTNER_SESSION_KEY, partnerId );
	} catch {
		// Ignore storage write failures.
	}
}

export function clearPersistedPartnerId(): void {
	const sessionStorage = getSessionStorage();

	if ( ! sessionStorage ) {
		return;
	}

	try {
		sessionStorage.removeItem( PARTNER_SESSION_KEY );
		sessionStorage.removeItem( LEGACY_PARTNER_SESSION_KEY );
	} catch {
		// Ignore storage clear failures.
	}
}

/**
 * Get partner config from Garden info.
 * Maps Garden partner/name combinations to branding configs.
 */
export function getPartnerConfigFromGarden(
	gardenPartner?: string,
	gardenName?: string,
	options: { persistToSession?: boolean } = {}
): PartnerConfig | null {
	if ( ! gardenPartner || ! gardenName ) {
		return null;
	}

	let partnerConfig: PartnerConfig | null = null;

	// Map garden partners to branding configs
	if ( gardenPartner === 'woo' && gardenName === 'commerce' ) {
		partnerConfig = PARTNERS.woo ?? null;
	}

	if ( partnerConfig && options.persistToSession ) {
		persistPartnerId( partnerConfig.id );
	}

	// Future: add mappings for other partners like "paypal"
	return partnerConfig;
}

export function getPartnerConfigFromSiteDetails(
	siteDetails?: {
		isCommerceGarden?: boolean | null;
		garden_name?: string | null;
		garden_partner?: string | null;
		garden?: { name?: string | null; partner?: string | null } | null;
	} | null,
	options: { persistToSession?: boolean } = {}
): PartnerConfig | null {
	if ( siteDetails?.isCommerceGarden ) {
		return getPartnerConfigFromGarden( 'woo', 'commerce', options );
	}

	const gardenName = siteDetails?.garden_name ?? siteDetails?.garden?.name;
	const gardenPartner = siteDetails?.garden_partner ?? siteDetails?.garden?.partner;

	if ( ! gardenName || ! gardenPartner ) {
		return null;
	}

	return getPartnerConfigFromGarden( gardenPartner, gardenName, options );
}

/**
 * Get partner config by matching a hostname against partner domains.
 */
function getPartnerConfigByHostname( hostname: string ): PartnerConfig | null {
	for ( const partnerConfig of Object.values( PARTNERS ) ) {
		if ( partnerConfig.domains?.includes( hostname ) ) {
			if ( isPartnerEnabled( partnerConfig ) ) {
				return partnerConfig;
			}
		}
	}
	return null;
}

/**
 * Get partner config by matching the current page's hostname against partner domains.
 */
export function getPartnerConfigFromCurrentDomain(): PartnerConfig | null {
	if ( typeof window === 'undefined' ) {
		return null;
	}
	return getPartnerConfigByHostname( window.location.hostname );
}

/**
 * Get partner config from the branding code query parameter.
 *
 * TODO: The `from` parameter is transitional. It provides backward compatibility
 * with existing flows (for example, ?from=woo). In a follow-up, replace it with a
 * dedicated branding-code query parameter (for example, ?branding=woo).
 */
export function getPartnerConfigFromBrandingCode(): PartnerConfig | null {
	if ( typeof window === 'undefined' ) {
		return null;
	}

	const params = new URLSearchParams( window.location.search );
	const from = params.get( 'from' );

	if ( from && PARTNERS[ from ] ) {
		const partnerConfig = PARTNERS[ from ];
		if ( isPartnerEnabled( partnerConfig ) ) {
			return partnerConfig;
		}
	}

	return null;
}

/**
 * Get partner config by matching a redirect URL hostname against partner domains.
 */
export function getPartnerConfigFromRedirectUrl(
	redirectUrl: string | string[] | undefined | null
): PartnerConfig | null {
	const urlValue = Array.isArray( redirectUrl ) ? redirectUrl[ 0 ] : redirectUrl;

	if ( ! urlValue ) {
		return null;
	}

	try {
		return getPartnerConfigByHostname( new URL( urlValue ).hostname );
	} catch {
		// Invalid URL, ignore
	}

	return null;
}

/**
 * Get partner config by matching an OAuth2 client against partner configs.
 */
export function getPartnerConfigFromOAuth2Client(
	oauth2Client: { id: number } | null | undefined
): PartnerConfig | null {
	if ( ! oauth2Client ) {
		return null;
	}

	for ( const partnerConfig of Object.values( PARTNERS ) ) {
		if ( partnerConfig.isOAuth2Client?.( oauth2Client ) ) {
			if ( isPartnerEnabled( partnerConfig ) ) {
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
 * Detect partner config from globally available values.
 *
 * The oauth2Client parameter comes from Redux (getCurrentOAuth2Client).
 * Other detection sources read from window.location internally.
 *
 * Detection precedence (first match wins):
 *   1. hostname           — window.location.hostname against partner domains
 *   2. branding code      — ?from= query param (transitional, see getPartnerConfigFromBrandingCode)
 *   3. OAuth2 client      — current OAuth2 client from Redux store matched against partner configs
 *   4. redirect_to        — hostname inside ?redirect_to= URL
 *   5. session storage    — persisted partner from a previous detection in this session
 */
export function detectPartnerConfig( oauth2Client?: { id: number } | null ): PartnerConfig | null {
	const detected =
		getPartnerConfigFromCurrentDomain() ??
		getPartnerConfigFromBrandingCode() ??
		getPartnerConfigFromOAuth2Client( oauth2Client ) ??
		getPartnerConfigFromRedirectUrl( getSearchParam( 'redirect_to' ) );

	if ( detected ) {
		persistPartnerId( detected.id );
		return detected;
	}

	// Session persistence fallback: if no detection source matches,
	// check if a partner was previously detected in this session.
	const persistedPartnerId = readPersistedPartnerId();

	if ( persistedPartnerId ) {
		const persistedConfig = PARTNERS[ persistedPartnerId ];

		if ( persistedConfig && isPartnerEnabled( persistedConfig ) ) {
			return persistedConfig;
		}

		clearPersistedPartnerId();
	}

	return null;
}

/**
 * Get allowed social services for a partner.
 * Detects partner from globally available values (see detectPartnerConfig).
 * Returns the array of allowed SSO providers or null if no restrictions apply.
 * @returns Array of allowed service names (e.g., ['paypal', 'google', 'apple']) or null
 */
export function getPartnerAllowedSocialServices(
	oauth2Client?: { id: number } | null
): AllowedSocialService[] | null {
	const partnerConfig = detectPartnerConfig( oauth2Client );
	return partnerConfig?.ssoProviders ?? null;
}

/**
 * Hook result
 */
export interface UsePartnerBrandingResult {
	/** Whether custom branding is active */
	hasCustomBranding: boolean;
	/** Partner config (null if no partner is detected or the feature flag is disabled) */
	partnerConfig: PartnerConfig | null;
	/** Ready-to-use logo element for TopBar, or undefined to use default */
	topBarLogo: JSX.Element | undefined;
	/** Ready-to-use ToS element for signup, or undefined to use default */
	signupTosElement: JSX.Element | undefined;
}

/**
 * Hook to get current partner branding based on URL params and feature flags.
 * Internally calls detectPartnerConfig() — callers do not need to pass any values.
 * @example
 * const { topBarLogo, partnerConfig, signupTosElement } = usePartnerBranding();
 *
 * // In TopBar:
 * <Step.TopBar logo={topBarLogo} ... />
 *
 * // For SSO filtering:
 * if (partnerConfig) {
 *   const allowedProviders = partnerConfig.ssoProviders;
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
	// The actual detection reads from window.location via detectPartnerConfig().
	const currentQuery = useSelector( getCurrentQueryArguments );
	const initialQuery = useSelector( getInitialQueryArguments );
	const from = currentQuery?.from || initialQuery?.from;
	const redirectTo = currentQuery?.redirect_to || initialQuery?.redirect_to;
	const oauth2Client = useSelector( getCurrentOAuth2Client );

	return useMemo( () => {
		const partnerConfig = detectPartnerConfig( oauth2Client );
		const hasCustomBranding = partnerConfig !== null;

		// Build logo element for TopBar
		const logoConfig = partnerConfig?.compactLogo ?? partnerConfig?.logo;
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
		const signupTosElement = getPartnerSignupTosElement( partnerConfig, translate );

		return {
			hasCustomBranding,
			partnerConfig,
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
	partnerConfig: PartnerConfig | null,
	translate: ReturnType< typeof useTranslate >
): JSX.Element | undefined {
	if ( ! partnerConfig ) {
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
	switch ( partnerConfig.id ) {
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
