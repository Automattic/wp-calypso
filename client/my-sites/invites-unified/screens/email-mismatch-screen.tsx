import { Step } from '@automattic/onboarding';
import { addQueryArgs } from '@wordpress/url';
import { useTranslate } from 'i18n-calypso';
import { useCallback } from 'react';
import { ActionButtons } from 'calypso/components/connect-screen/action-buttons';
import DocumentHead from 'calypso/components/data/document-head';
import BodySectionCssClass from 'calypso/layout/body-section-css-class';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { navigate } from 'calypso/lib/navigate';
import { login } from 'calypso/lib/paths';

import './style.scss';

interface EmailMismatchScreenProps {
	inviteSentTo: string;
	isKnownUser: boolean;
	topBarLogo?: React.ReactNode;
	trackingProps: Record< string, unknown >;
}

export function EmailMismatchScreen( {
	inviteSentTo,
	isKnownUser,
	topBarLogo,
	trackingProps,
}: EmailMismatchScreenProps ) {
	const translate = useTranslate();

	const getLoginUrl = useCallback( () => {
		const loginUrl = login( { redirectTo: window.location.href } );
		if ( inviteSentTo ) {
			return addQueryArgs( loginUrl, { email_address: inviteSentTo } );
		}
		return loginUrl;
	}, [ inviteSentTo ] );

	const handleSignIn = useCallback( () => {
		recordTracksEvent( 'calypso_invite_accept_logged_in_sign_in_link_click', trackingProps );
		navigate( getLoginUrl() );
	}, [ trackingProps, getLoginUrl ] );

	const title = translate( 'This invite is only valid for %(email)s', {
		args: { email: inviteSentTo },
	} );

	const description = translate(
		'Please sign in with the correct account to accept this invitation.'
	);

	const signInButtonLabel = isKnownUser
		? translate( 'Sign in as %(email)s', {
				args: { email: inviteSentTo },
		  } )
		: translate( 'Register as %(email)s', {
				args: { email: inviteSentTo },
		  } );

	const heading = <Step.Heading text={ title } subText={ description } />;
	const topBar = <Step.TopBar logo={ topBarLogo } />;

	return (
		<>
			<DocumentHead title={ translate( 'Accept Invite', { textOnly: true } ) } />
			<BodySectionCssClass bodyClass={ [ 'is-section-accept-invite-unified' ] } />
			<Step.CenteredColumnLayout
				columnWidth={ 4 }
				heading={ heading }
				verticalAlign="center"
				topBar={ topBar }
			>
				<ActionButtons primaryLabel={ signInButtonLabel } primaryOnClick={ handleSignIn } />
			</Step.CenteredColumnLayout>
		</>
	);
}

export default EmailMismatchScreen;
