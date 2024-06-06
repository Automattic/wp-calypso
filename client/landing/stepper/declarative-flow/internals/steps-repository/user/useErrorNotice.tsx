import { useTranslate } from 'i18n-calypso';
import Notice from 'calypso/components/notice';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { login } from 'calypso/lib/paths';
import { AccountCreateReturn } from 'calypso/lib/signup/api/type';
import { addQueryArgs } from 'calypso/lib/url';
import { SocialAuthParams } from './useUserProcessingCallbacks';

type Props = {
	accountCreateResponse?: AccountCreateReturn;
	recentSocialAuthAttemptParams?: SocialAuthParams;
};

export default function useErrorNotice( {
	accountCreateResponse,
	recentSocialAuthAttemptParams,
}: Props ) {
	const translate = useTranslate();
	const loginLink = login( {
		signupUrl: window.location.pathname + window.location.search,
	} );
	let userExistsError = null;
	if ( accountCreateResponse && 'errors' in accountCreateResponse ) {
		userExistsError = accountCreateResponse?.errors?.find(
			( { error } ) => error === 'user_exists'
		);
	}
	if ( userExistsError ) {
		return (
			<Notice
				className="signup-form__notice signup-form__span-columns"
				showDismiss={ false }
				status="is-transparent-info"
				text={ translate(
					'We found a WordPress.com account with the email "%(email)s". ' +
						'{{a}}Log in to connect it{{/a}}, or use a different email to sign up.',
					{
						args: { email: userExistsError.data?.email },
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
