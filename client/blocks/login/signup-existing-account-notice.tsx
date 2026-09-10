import { useTranslate } from 'i18n-calypso';
import Notice from 'calypso/dashboard/components/notice';
import { useDispatch, useSelector } from 'calypso/state';
import { recordTracksEventWithClientId } from 'calypso/state/analytics/actions';
import getCurrentQueryArguments from 'calypso/state/selectors/get-current-query-arguments';
import getInitialQueryArguments from 'calypso/state/selectors/get-initial-query-arguments';

/**
 * Explain the redirect signup makes when the address already has an account.
 *
 * Lives in the login block rather than the layout's notice slot: that slot is
 * skipped for Grav-powered clients, and the redirect preserves the OAuth2 client
 * it started from, so Gravatar sign-ups land here too.
 */
export default function SignupExistingAccountNotice( { signupUrl }: { signupUrl: string } ) {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const initialQuery = useSelector( getInitialQueryArguments );
	const currentQuery = useSelector( getCurrentQueryArguments );

	if ( ! initialQuery?.is_signup_existing_account && ! currentQuery?.is_signup_existing_account ) {
		return null;
	}

	// Matches how the form below resolves the address it prefills.
	const address = initialQuery?.email_address ?? currentQuery?.email_address;
	const email = typeof address === 'string' ? address : undefined;

	const components = {
		a: (
			<a
				href={ signupUrl }
				onClick={ () =>
					dispatch(
						recordTracksEventWithClientId( 'calypso_login_sign_up_link_click', {
							origin: 'login-notice',
						} )
					)
				}
			/>
		),
	};

	return (
		<Notice variant="info">
			{ email
				? translate(
						'We found a WordPress.com account with the email %(email)s. Log in below, or {{a}}sign up with a different email{{/a}}.',
						{ args: { email }, components }
				  )
				: translate(
						'We found a WordPress.com account with that email address. Log in below, or {{a}}sign up with a different email{{/a}}.',
						{ components }
				  ) }
		</Notice>
	);
}
