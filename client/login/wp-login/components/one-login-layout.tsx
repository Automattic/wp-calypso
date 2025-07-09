import { recordTracksEvent } from '@automattic/calypso-analytics';
import { Step } from '@automattic/onboarding';
import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import { getSignupUrl, pathWithLeadingSlash } from 'calypso/lib/login';
import { useLoginContext } from 'calypso/login/login-context';
import { getCurrentUserLocale } from 'calypso/state/current-user/selectors';
import { getCurrentOAuth2Client } from 'calypso/state/oauth2-clients/ui/selectors';
import { getCurrentQueryArguments } from 'calypso/state/selectors/get-current-query-arguments';
import { getCurrentRoute } from 'calypso/state/selectors/get-current-route';
import HeadingLogo from './heading-logo';

interface OneLoginLayoutProps {
	isJetpack: boolean;
	isFromAkismet: boolean;
	children: React.ReactNode;
	signupUrl?: string;
}

const OneLoginLayout = ( {
	isJetpack,
	isFromAkismet,
	children,
	signupUrl: signupUrlProp,
}: OneLoginLayoutProps ) => {
	const translate = useTranslate();
	const locale = useSelector( getCurrentUserLocale );
	const currentRoute = useSelector( getCurrentRoute );
	const currentQuery = useSelector( getCurrentQueryArguments );
	const oauth2Client = useSelector( getCurrentOAuth2Client );
	const { headingText, subHeadingText } = useLoginContext();

	const SignUpLink = () => {
		// use '?signup_url' if explicitly passed as URL query param
		const signupUrl = signupUrlProp
			? window.location.origin + pathWithLeadingSlash( signupUrlProp )
			: getSignupUrl( currentQuery, currentRoute, oauth2Client, locale );

		return (
			<Step.LinkButton
				href={ signupUrl }
				key="sign-up-link"
				onClick={ () => {
					recordTracksEvent( 'calypso_login_sign_up_link_click', { origin: 'login-layout' } );
				} }
				rel="external"
			>
				{ translate( 'Create an account' ) }
			</Step.LinkButton>
		);
	};

	return (
		<Step.CenteredColumnLayout
			columnWidth={ 6 }
			topBar={ <Step.TopBar rightElement={ <SignUpLink /> } compactLogo="always" /> }
			verticalAlign="center"
		>
			<div className="wp-login__one-login-layout-content-wrapper">
				<div className="wp-login__header">
					<HeadingLogo isFromAkismet={ isFromAkismet } isJetpack={ isJetpack } />
					<Step.Heading text={ <div className="wp-login__heading-text">{ headingText }</div> } />
					<h2 className="wp-login__heading-subtext">{ subHeadingText }</h2>
				</div>
				{ children }
			</div>
		</Step.CenteredColumnLayout>
	);
};

export default OneLoginLayout;
