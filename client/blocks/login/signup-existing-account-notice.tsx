import { Notice } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { getSignupUrl, pathWithLeadingSlash } from 'calypso/lib/login';
import { useDispatch, useSelector } from 'calypso/state';
import { recordTracksEventWithClientId } from 'calypso/state/analytics/actions';
import { getCurrentOAuth2Client } from 'calypso/state/oauth2-clients/ui/selectors';
import getCurrentLocaleSlug from 'calypso/state/selectors/get-current-locale-slug';
import getCurrentQueryArguments from 'calypso/state/selectors/get-current-query-arguments';
import getCurrentRoute from 'calypso/state/selectors/get-current-route';

import './signup-existing-account-notice.scss';

/**
 * Explain the redirect signup makes when the address already has an account.
 *
 * Resolves its own signup link so it can render from either login layout: the
 * Grav-powered clients skip the shared one, and the redirect here preserves the
 * OAuth2 client it started from, so Gravatar sign-ups reach this too.
 */
export default function SignupExistingAccountNotice() {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const currentQuery = useSelector( getCurrentQueryArguments );
	const currentRoute = useSelector( getCurrentRoute );
	const oauth2Client = useSelector( getCurrentOAuth2Client );
	const locale = useSelector( getCurrentLocaleSlug );

	// Only the current query: signup puts the marker and the address there together,
	// and navigating on within login drops both, which is when this stops applying.
	// It also keeps `currentQuery` non-empty, so the signup URL below resolves the
	// same way the login block's own resolver would.
	if ( ! currentQuery?.is_signup_existing_account ) {
		return null;
	}

	const address = currentQuery.email_address;
	const email = typeof address === 'string' ? address : undefined;

	const override = currentQuery?.signup_url;
	const signupUrl =
		typeof override === 'string'
			? window.location.origin + pathWithLeadingSlash( override )
			: getSignupUrl( currentQuery, currentRoute, oauth2Client, locale, window.location.pathname );

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
		<Notice className="signup-existing-account-notice" status="info" isDismissible={ false }>
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
