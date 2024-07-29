import { useTranslate } from 'i18n-calypso';
import Notice from 'calypso/components/notice';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { login } from 'calypso/lib/paths';
import { addQueryArgs } from 'calypso/lib/url';
import type { AccountCreateReturn, SocialAuthParams } from 'calypso/lib/signup/api/type';

type Props = {
	error: ( Error & AccountCreateReturn ) | null;
	recentSocialAuthAttemptParams?: SocialAuthParams;
};

export function useErrorNotice( { error: errorResponse, recentSocialAuthAttemptParams }: Props ) {
	const translate = useTranslate();
	const loginLink = login( {
		signupUrl: window.location.pathname + window.location.search,
	} );
	if ( errorResponse && 'error' in errorResponse && errorResponse?.error === 'user_exists' ) {
		return (
			<Notice
				className="signup-form__notice signup-form__span-columns"
				showDismiss={ false }
				status="is-transparent-info"
				text={ translate(
					'We found a WordPress.com account with the email "%(email)s". ' +
						'{{a}}Log in to connect it{{/a}}, or use a different email to sign up.',
					{
						args: { email: errorResponse.data?.email },
						components: {
							a: (
								<a
									href={ loginLink }
									onClick={ ( event ) => {
										event.preventDefault();
										recordTracksEvent( 'calypso_signup_social_existing_user_login_link_click' );
										window.location.href = addQueryArgs(
											{
												service: recentSocialAuthAttemptParams?.service,
												access_token: recentSocialAuthAttemptParams?.access_token,
												id_token: recentSocialAuthAttemptParams?.id_token,
											},
											loginLink
										);
									} }
								/>
							),
						},
					}
				) }
			/>
		);
	}
	return false;
}
