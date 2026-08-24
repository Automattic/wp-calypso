import { capitalize } from '@automattic/js-utils';
import clsx from 'clsx';
import { TranslateResult, fixMe } from 'i18n-calypso';
import { getLoginCopy } from 'calypso/jetpack-connect/connection-content';
import {
	isJetpackCloudOAuth2Client,
	isA4AOAuth2Client,
	isBlazeProOAuth2Client,
	isPartnerPortalOAuth2Client,
	isVIPOAuth2Client,
	isSharedMobileAppOAuth2Client,
	isIosOAuth2Client,
} from 'calypso/lib/oauth2-clients';
import { getOAuth2Client } from 'calypso/state/oauth2-clients/selectors';
import getCurrentQueryArguments from 'calypso/state/selectors/get-current-query-arguments';
import type { PartnerConfig } from 'calypso/lib/partner-branding';

interface Props {
	twoFactorAuthType: string | null;
	isManualRenewalImmediateLoginAttempt: boolean;
	socialConnect: boolean;
	linkingSocialService: string;
	action: string;
	oauth2Client: ReturnType< typeof getOAuth2Client >;
	currentQuery: ReturnType< typeof getCurrentQueryArguments >;
	translate: ( arg0: string, arg1?: object ) => TranslateResult;
	isJetpack?: boolean;
	isJetpackApp?: boolean;
	twoStepNonce?: string | null;
	isSocialFirst?: boolean;
	isWooJPC?: boolean;
	isWCCOM?: boolean;
	isBlazePro?: boolean;
	isFromAkismet?: boolean;
	isFromPassport?: boolean;
	isFromAutomatticForAgenciesPlugin?: boolean;
	isFromJetpackConnector?: boolean;
	connectorPlugins?: string[];
	partnerConfig?: PartnerConfig | null;
	isGravPoweredClient?: boolean;
	isUserLoggedIn?: boolean;
}

const getLoggedInUserHeaderText = ( {
	isSocialFirst,
	isWooJPC,
	isWCCOM,
	isBlazePro,
	translate,
}: {
	isSocialFirst?: boolean;
	isWooJPC?: boolean;
	isWCCOM?: boolean;
	isBlazePro?: boolean;
	translate: ( arg0: string, arg1?: object ) => TranslateResult;
} ): TranslateResult | null => {
	if ( isSocialFirst && ( isWooJPC || isWCCOM || isBlazePro ) ) {
		return translate( 'Connect your account' );
	}
	return null;
};

/**
 * Branded title for the shared WordPress/Jetpack mobile app OAuth2 clients.
 *
 * Both apps share the same client IDs, so the stored client title/name is not a
 * reliable brand (production has shown values like `wordpress-app-ios`). The
 * Jetpack app is identified by its `jetpack://` redirect_uri. Returns null when
 * the client is not one of the shared mobile app clients.
 */
export function getMobileAppClientName( {
	oauth2Client,
	isJetpackApp,
	translate,
}: {
	oauth2Client: { id: number } | null | undefined;
	isJetpackApp?: boolean;
	translate: Props[ 'translate' ];
} ): TranslateResult | null {
	if ( ! isSharedMobileAppOAuth2Client( oauth2Client ) ) {
		return null;
	}

	if ( isJetpackApp ) {
		return isIosOAuth2Client( oauth2Client )
			? translate( 'Jetpack for iOS' )
			: translate( 'Jetpack for Android' );
	}

	return isIosOAuth2Client( oauth2Client )
		? translate( 'WordPress for iOS' )
		: translate( 'WordPress for Android' );
}

/**
 * This function is used to get the header text for the login page.
 * TODO: We'll convert this to hook form in the future.
 */
export function getHeaderText( {
	isSocialFirst,
	twoFactorAuthType,
	isManualRenewalImmediateLoginAttempt,
	socialConnect,
	linkingSocialService,
	action,
	oauth2Client,
	isWooJPC,
	isJetpack,
	isJetpackApp,
	isWCCOM,
	isBlazePro,
	isFromAkismet,
	isFromPassport,
	isFromAutomatticForAgenciesPlugin,
	isFromJetpackConnector,
	connectorPlugins,
	partnerConfig,
	isGravPoweredClient,
	currentQuery,
	translate,
	twoStepNonce,
	isUserLoggedIn,
}: Props ): TranslateResult {
	if ( isUserLoggedIn ) {
		const loggedInText = getLoggedInUserHeaderText( {
			isSocialFirst,
			isWooJPC,
			isWCCOM,
			isBlazePro,
			translate,
		} );
		if ( loggedInText ) {
			return loggedInText;
		}
	}

	let headerText = translate( 'Log in to your account' );

	if ( isSocialFirst ) {
		if ( isFromJetpackConnector ) {
			// In the unified connection flow the site is already registered by
			// the time the user lands on the login page, so the H1 stays
			// neutral. The plugin set is forwarded so the resolver can pick
			// the right (dynamic) subtitle and so the title can become
			// plugin-dependent in the future without touching this call site.
			headerText = getLoginCopy( connectorPlugins ).title;
		} else if ( partnerConfig ) {
			headerText = translate( 'Log in to %(partner)s', {
				args: { partner: partnerConfig.displayName },
			} );
		} else {
			// Resolve a known brand name. These are authoritative and rendered
			// verbatim; only the raw client slug fallback below is title-cased.
			let clientName: TranslateResult | undefined;
			const mobileAppClientName = getMobileAppClientName( {
				oauth2Client,
				isJetpackApp,
				translate,
			} );
			if ( isFromAkismet ) {
				clientName = 'Akismet';
			} else if ( isFromPassport ) {
				clientName = 'Passport';
			} else if ( mobileAppClientName ) {
				clientName = mobileAppClientName;
			} else if ( isBlazeProOAuth2Client( oauth2Client ) ) {
				clientName = 'Blaze Pro';
			} else if ( isA4AOAuth2Client( oauth2Client ) ) {
				clientName = 'Automattic for Agencies';
			} else if ( isJetpackCloudOAuth2Client( oauth2Client ) ) {
				clientName = 'Jetpack Cloud';
			} else if ( isJetpack ) {
				clientName = 'Jetpack';
			} else if ( isWCCOM ) {
				clientName = 'Woo';
			} else if ( isVIPOAuth2Client( oauth2Client ) ) {
				clientName = 'VIP';
			}

			/**
			 * Override WooJPC. It's technically a Jetpack client, but we want to show "Woo" instead of "Jetpack".
			 * This condition overrides the clientName set in the above if/elseif statement.
			 */
			if ( isWooJPC ) {
				clientName = 'Woo';
			}

			// A resolved brand name is authoritative and rendered verbatim. Fall back
			// to the raw client slug otherwise, which `text-transform: capitalize`
			// prettifies (e.g. "crowdsignal" -> "Crowdsignal").
			const isBrandedName = clientName !== undefined;
			if ( ! isBrandedName ) {
				clientName = oauth2Client?.name;
			}

			headerText = clientName
				? ( fixMe( {
						text: 'Log in to {{span}}%(client)s{{/span}} with WordPress.com',
						newCopy: translate( 'Log in to {{span}}%(client)s{{/span}} with WordPress.com', {
							args: { client: clientName },
							components: {
								span: (
									<span
										className={ clsx( 'wp-login__one-login-header-client-name', {
											'is-exact-case': isBrandedName,
										} ) }
									/>
								),
							},
						} ),
						oldCopy: translate( 'Log in to WordPress.com' ),
				  } ) as TranslateResult )
				: translate( 'Log in to WordPress.com' );
		}
	}

	if ( twoFactorAuthType === 'authenticator' || twoFactorAuthType === 'email' ) {
		headerText = translate( 'Continue with an authentication code' );
	}

	if ( twoFactorAuthType === 'push' ) {
		headerText = translate( 'Continue with the Jetpack app' );
	} else if ( twoFactorAuthType === 'backup' ) {
		headerText = translate( 'Continue with a backup code' );
	}

	if ( isManualRenewalImmediateLoginAttempt ) {
		headerText = translate( 'Log in to update your payment details and renew your subscription' );
	}

	if ( twoStepNonce ) {
		headerText = translate( 'Two-Step Authentication' );
	}

	if ( socialConnect ) {
		headerText = translate( 'Connect your %(service)s account', {
			args: {
				service: capitalize( linkingSocialService ),
			},
		} );
	}

	if ( action === 'lostpassword' ) {
		headerText = translate( 'Lost your password?' );
	} else if ( currentQuery?.lostpassword_flow === 'true' ) {
		headerText = translate( "You've got mail" );
	} else if ( oauth2Client ) {
		if ( isPartnerPortalOAuth2Client( oauth2Client ) ) {
			if ( document.location.search?.includes( 'wpcloud' ) ) {
				headerText = translate( 'Log in to WP Cloud with WordPress.com' );
			} else {
				headerText = translate(
					'Howdy! Log into the Automattic Partner Portal with your WordPress.com account.'
				);
			}
		}

		if ( isGravPoweredClient ) {
			headerText = translate( 'Login to %(clientTitle)s', {
				args: { clientTitle: oauth2Client.title },
			} );
		}
	}

	if ( isFromAutomatticForAgenciesPlugin ) {
		headerText = translate( 'Log in to Automattic for Agencies' );
	}

	return headerText;
}
