import { useTranslate, TranslateResult, fixMe } from 'i18n-calypso';
import { capitalize } from 'lodash';
import VisitSite from 'calypso/blocks/visit-site';
import GravatarLoginLogo from 'calypso/components/gravatar-login-logo';
import {
	isJetpackCloudOAuth2Client,
	isA4AOAuth2Client,
	isBlazeProOAuth2Client,
	isGravatarFlowOAuth2Client,
	isPartnerPortalOAuth2Client,
	isGravatarOAuth2Client,
	isVIPOAuth2Client,
} from 'calypso/lib/oauth2-clients';
import './login-header.scss';

interface LoginHeaderProps {
	action: string;
	currentQuery: Record< string, string >;
	fromSite: string | null;
	isFromAkismet: boolean;
	isFromAutomatticForAgenciesPlugin: boolean;
	isGravPoweredClient: boolean;
	isGravPoweredLoginPage: boolean;
	isJetpack: boolean;
	isManualRenewalImmediateLoginAttempt: boolean;
	isSignupExistingAccount: boolean;
	isSocialFirst: boolean;
	isWCCOM: boolean;
	isBlazePro: boolean;
	linkingSocialService: string;
	oauth2Client: {
		title: string;
		icon: string;
		name: string;
	} | null;
	socialConnect: boolean;
	twoStepNonce: string | null;
	wccomFrom: string;
	isWooJPC: boolean;
	twoFactorAuthType: string;
	twoFactorEnabled: boolean;
	initialQuery: { 'client-id': string; redirect_to: string } | null;
	getSignupLinkComponent: () => JSX.Element;
	showContinueAsUser: boolean;
}

export function getHeaderText(
	isSocialFirst: boolean,
	twoFactorAuthType: string | null,
	isManualRenewalImmediateLoginAttempt: boolean,
	socialConnect: boolean,
	linkingSocialService: string,
	action: string,
	oauth2Client: { title: string; icon: string; name: string } | null,
	isWooJPC: boolean,
	isJetpack: boolean,
	isWCCOM: boolean,
	isFromAkismet: boolean,
	isFromAutomatticForAgenciesPlugin: boolean,
	isGravPoweredClient: boolean,
	twoFactorEnabled: boolean,
	currentQuery: Record< string, string >,
	translate: ( arg0: string, arg1?: object ) => TranslateResult,
	twoStepNonce: string | null = null
): TranslateResult {
	let headerText = translate( 'Log in to your account' );

	if ( isSocialFirst ) {
		let clientName = oauth2Client?.name;
		if ( isFromAkismet ) {
			clientName = 'Akismet';
		} else if ( isBlazeProOAuth2Client( oauth2Client ) ) {
			clientName = 'Blaze Pro';
		} else if ( isA4AOAuth2Client( oauth2Client ) ) {
			clientName = 'Automattic for Agencies';
		} else if ( isJetpackCloudOAuth2Client( oauth2Client ) ) {
			clientName = 'Jetpack Cloud';
		} else if ( isJetpack ) {
			clientName = 'Jetpack';
		} else if ( isWCCOM ) {
			headerText = translate( 'Log in to Woo with WordPress.com' );
		} else if ( isVIPOAuth2Client( oauth2Client ) ) {
			clientName = 'VIP';
		}

		headerText = clientName
			? ( fixMe( {
					text: 'Log in to {{span}}%(client)s{{/span}} with WordPress.com',
					newCopy: translate( 'Log in to {{span}}%(client)s{{/span}} with WordPress.com', {
						args: { client: clientName },
						components: { span: <span className="login-header-text__client-name" /> },
					} ),
					oldCopy: translate( 'Log in to WordPress.com' ),
			  } ) as TranslateResult )
			: translate( 'Log in to WordPress.com' );
	}

	if ( twoFactorAuthType === 'authenticator' ) {
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
		headerText = translate( 'Forgot your password?' );
	} else if ( currentQuery.lostpassword_flow === 'true' ) {
		headerText = translate( "You've got mail" );
	} else if ( oauth2Client ) {
		if ( isJetpackCloudOAuth2Client( oauth2Client ) ) {
			headerText = translate( 'Howdy! Log in to Jetpack.com with your WordPress.com account.' );
		}

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
	} else if ( isWooJPC ) {
		if ( twoFactorEnabled ) {
			headerText = translate( 'Authenticate your login' );
		} else {
			headerText = translate( 'Log in to your account' );
		}
	}

	if ( isFromAutomatticForAgenciesPlugin ) {
		headerText = translate( 'Log in to Automattic for Agencies' );
	}

	return headerText;
}

export function LoginHeader( {
	action,
	currentQuery,
	fromSite,
	isFromAkismet,
	isFromAutomatticForAgenciesPlugin,
	isGravPoweredLoginPage,
	isJetpack,
	isManualRenewalImmediateLoginAttempt,
	isSocialFirst,
	isWCCOM,
	linkingSocialService,
	oauth2Client,
	socialConnect,
	twoStepNonce,
	isWooJPC,
	twoFactorAuthType,
	twoFactorEnabled,
}: LoginHeaderProps ) {
	const translate = useTranslate();

	const headerText = getHeaderText(
		isSocialFirst,
		twoFactorAuthType,
		isManualRenewalImmediateLoginAttempt,
		socialConnect,
		linkingSocialService,
		action,
		oauth2Client,
		isWooJPC,
		isJetpack,
		isWCCOM,
		isFromAkismet,
		isFromAutomatticForAgenciesPlugin,
		true, // isGravPoweredClient is always true
		twoFactorEnabled,
		currentQuery,
		translate,
		twoStepNonce
	);

	const preHeader = null;
	const header = null;
	let postHeader = null;

	if ( isGravPoweredLoginPage ) {
		const isFromGravatar3rdPartyApp =
			isGravatarOAuth2Client( oauth2Client ) && currentQuery?.gravatar_from === '3rd-party';
		const isFromGravatarQuickEditor =
			isGravatarOAuth2Client( oauth2Client ) && currentQuery?.gravatar_from === 'quick-editor';
		const isGravatarFlowWithEmail = !! (
			isGravatarFlowOAuth2Client( oauth2Client ) && currentQuery?.email_address
		);

		postHeader = (
			<p className="login__header-subtitle">
				{ isFromGravatar3rdPartyApp || isFromGravatarQuickEditor || isGravatarFlowWithEmail
					? translate( 'Please log in with your email and password.' )
					: translate(
							'If you prefer logging in with a password, or a social media account, choose below:'
					  ) }
			</p>
		);
	} else if ( fromSite ) {
		// if redirected from Calypso URL with a site slug, offer a link to that site's frontend
		postHeader = <VisitSite siteSlug={ fromSite } />;
	}

	return (
		<div className="login__form-header-wrapper">
			<GravatarLoginLogo
				iconUrl={ oauth2Client?.icon }
				alt={ oauth2Client?.title || '' }
				isCoBrand={ isGravatarFlowOAuth2Client( oauth2Client ) }
			/>
			{ preHeader }
			<div className="login__form-header">{ header || headerText }</div>
			{ postHeader }
		</div>
	);
}
