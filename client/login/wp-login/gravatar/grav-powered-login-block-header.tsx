import { useTranslate } from 'i18n-calypso';
import VisitSite from 'calypso/blocks/visit-site';
import GravatarLoginLogo from 'calypso/components/gravatar-login-logo';
import { isGravatarFlowOAuth2Client, isGravatarOAuth2Client } from 'calypso/lib/oauth2-clients';
import { getHeaderText } from 'calypso/login/wp-login/hooks/get-header-text';

interface Props {
	action: string;
	currentQuery: Record< string, string >;
	fromSite: string | null;
	isGravPoweredLoginPage: boolean;
	isJetpack: boolean;
	isManualRenewalImmediateLoginAttempt: boolean;
	isWCCOM: boolean;
	linkingSocialService: string;
	oauth2Client: {
		title: string;
		icon: string;
		name: string;
	} | null;
	socialConnect: boolean;
	twoStepNonce: string | null;
	twoFactorAuthType: string;
	twoFactorEnabled: boolean;
}

const GravPoweredLoginBlockHeader = ( {
	action,
	currentQuery,
	fromSite,
	isGravPoweredLoginPage,
	isJetpack,
	isManualRenewalImmediateLoginAttempt,
	isWCCOM,
	linkingSocialService,
	oauth2Client,
	socialConnect,
	twoStepNonce,
	twoFactorAuthType,
	twoFactorEnabled,
}: Props ) => {
	const translate = useTranslate();

	const headerText = getHeaderText(
		false, // isSocialFirst
		twoFactorAuthType,
		isManualRenewalImmediateLoginAttempt,
		socialConnect,
		linkingSocialService,
		action,
		oauth2Client,
		false, // isWooJPC
		isJetpack,
		isWCCOM,
		false, // isFromAkismet
		false, // isFromAutomatticForAgenciesPlugin
		true, // isGravPoweredClient is always true
		twoFactorEnabled,
		currentQuery,
		translate,
		twoStepNonce
	);

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
		/**
		 * If redirected from Calypso URL with a site slug, offer a link to that site's frontend
		 *
		 * TODO clk This should probably migrate to the footer for default Login, if still relevant
		 */
		postHeader = <VisitSite siteSlug={ fromSite } />;
	}

	return (
		<div className="login__form-header-wrapper">
			<GravatarLoginLogo
				iconUrl={ oauth2Client?.icon }
				alt={ oauth2Client?.title || '' }
				isCoBrand={ isGravatarFlowOAuth2Client( oauth2Client ) }
			/>
			<div className="login__form-header">{ headerText }</div>
			{ postHeader }
		</div>
	);
};

export default GravPoweredLoginBlockHeader;
