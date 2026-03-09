import { recordTracksEvent } from '@automattic/calypso-analytics';
import config from '@automattic/calypso-config';
import { localizeUrl } from '@automattic/i18n-utils';
import { createInterpolateElement } from '@wordpress/element';
import { useTranslate } from 'i18n-calypso';
import { get } from 'lodash';
import { useMemo } from 'react';
import wooLogo from 'calypso/assets/images/icons/Woo_logo_color.svg';
import { useSelector } from 'calypso/state';
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
	/** Partner identifier (matches URL ?from= param) */
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
	},
};

const CIAB_PARTNER_SESSION_KEY = 'calypso.ciab.partner-id';

function getFirstFromValue( from: string | string[] | undefined ): string | undefined {
	if ( Array.isArray( from ) ) {
		return from[ 0 ];
	}

	return from;
}

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
 * Get CIAB partner config from URL 'from' param
 * Returns the full partner config or null if not a CIAB partner
 */
export function getCiabConfig( from: string | string[] | undefined ): CiabPartnerConfig | null {
	const fromValue = getFirstFromValue( from );

	if ( fromValue && CIAB_PARTNERS[ fromValue ] ) {
		const partnerConfig = CIAB_PARTNERS[ fromValue ];
		// Check if feature flag is enabled
		if ( config.isEnabled( partnerConfig.featureFlag ) ) {
			return partnerConfig;
		}
	}

	return null;
}

export function getEffectiveCiabConfig(
	currentFrom: string | string[] | undefined,
	initialFrom: string | string[] | undefined = undefined
): CiabPartnerConfig | null {
	const currentFromValue = getFirstFromValue( currentFrom );

	if ( currentFromValue !== undefined ) {
		const currentCiabConfig = getCiabConfig( currentFromValue );

		if ( currentCiabConfig ) {
			persistCiabPartnerId( currentCiabConfig.id );
			return currentCiabConfig;
		}

		clearPersistedCiabPartnerId();
		return null;
	}

	const initialCiabConfig = getCiabConfig( initialFrom );

	if ( initialCiabConfig ) {
		persistCiabPartnerId( initialCiabConfig.id );
		return initialCiabConfig;
	}

	const persistedPartnerId = readPersistedCiabPartnerId();

	if ( ! persistedPartnerId ) {
		return null;
	}

	const persistedCiabConfig = getCiabConfig( persistedPartnerId );

	if ( ! persistedCiabConfig ) {
		clearPersistedCiabPartnerId();
		return null;
	}

	return persistedCiabConfig;
}

/**
 * Get allowed social services for a partner from URL 'from' param
 * Returns the array of allowed SSO providers or null if no restrictions apply
 * @param from - The 'from' query parameter value
 * @returns Array of allowed service names (e.g., ['paypal', 'google', 'apple']) or null
 */
export function getPartnerAllowedSocialServices(
	from: string | string[] | undefined
): AllowedSocialService[] | null {
	const ciabConfig = getCiabConfig( from );
	return ciabConfig?.ssoProviders ?? null;
}

export function getEffectivePartnerAllowedSocialServices(
	currentFrom: string | string[] | undefined,
	initialFrom: string | string[] | undefined = undefined
): AllowedSocialService[] | null {
	const ciabConfig = getEffectiveCiabConfig( currentFrom, initialFrom );

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
 * Hook to get current partner branding based on URL params and feature flags
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
	const fromCurrent = useSelector( ( state ) => get( getCurrentQueryArguments( state ), 'from' ) );
	const fromInitial = useSelector( ( state ) => get( getInitialQueryArguments( state ), 'from' ) );

	return useMemo( () => {
		const ciabConfig = getEffectiveCiabConfig( fromCurrent, fromInitial );
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
	}, [ fromCurrent, fromInitial, translate ] );
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
					'Just a little reminder that by continuing with any of the options below, you agree to our <tosLink>Terms of Service</tosLink> and <privacyLink>Privacy Policy</privacyLink>.'
				),
				linkComponents
			);
		default:
			return undefined;
	}
}
