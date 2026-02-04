import config from '@automattic/calypso-config';
import { get } from 'lodash';
import { useMemo } from 'react';
import wooLogo from 'calypso/assets/images/icons/Woo_logo_color.svg';
import { useSelector } from 'calypso/state';
import getCurrentQueryArguments from 'calypso/state/selectors/get-current-query-arguments';
import getInitialQueryArguments from 'calypso/state/selectors/get-initial-query-arguments';

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
	ssoProviders: string[];
	/** Font style identifier for login/signup headings */
	fontStyle?: 'system';
}

/**
 * CIAB Partners Configuration
 *
 * To add a new partner:
 * 1. Add entry here with all config
 * 2. Add feature flag to config/_shared.json and config/development.json
 * 3. Done! No other code changes needed.
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

/**
 * Get CIAB partner config from URL 'from' param
 * Returns the full partner config or null if not a CIAB partner
 */
export function getCiabConfig( from: string | string[] | undefined ): CiabPartnerConfig | null {
	const fromValue = Array.isArray( from ) ? from[ 0 ] : from;

	if ( fromValue && CIAB_PARTNERS[ fromValue ] ) {
		const partnerConfig = CIAB_PARTNERS[ fromValue ];
		// Check if feature flag is enabled
		if ( config.isEnabled( partnerConfig.featureFlag ) ) {
			return partnerConfig;
		}
	}

	return null;
}

/**
 * Get allowed social services for a partner from URL 'from' param
 * Returns the array of allowed SSO providers or null if no restrictions apply
 * @param from - The 'from' query parameter value
 * @returns Array of allowed service names (e.g., ['paypal', 'google', 'apple']) or null
 */
export function getPartnerAllowedSocialServices(
	from: string | string[] | undefined
): string[] | null {
	const ciabConfig = getCiabConfig( from );
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
}

/**
 * Hook to get current partner branding based on URL params and feature flags
 * @example
 * const { topBarLogo, ciabConfig } = usePartnerBranding();
 *
 * // In TopBar:
 * <Step.TopBar logo={topBarLogo} ... />
 *
 * // For SSO filtering:
 * if (ciabConfig) {
 *   const allowedProviders = ciabConfig.ssoProviders;
 * }
 *
 * // For header text:
 * if (ciabConfig) {
 *   headerText = `Log in to ${ciabConfig.displayName}`;
 * }
 */
export function usePartnerBranding(): UsePartnerBrandingResult {
	const fromInitial = useSelector( ( state ) => get( getInitialQueryArguments( state ), 'from' ) );
	const fromCurrent = useSelector( ( state ) => get( getCurrentQueryArguments( state ), 'from' ) );

	const from = fromCurrent || fromInitial;

	return useMemo( () => {
		const ciabConfig = getCiabConfig( from );
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

		return {
			hasCustomBranding,
			ciabConfig,
			topBarLogo,
		};
	}, [ from ] );
}
