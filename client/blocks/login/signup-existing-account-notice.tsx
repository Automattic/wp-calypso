import { Notice } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { getSignupUrl, pathWithLeadingSlash } from 'calypso/lib/login';
import { useDispatch, useSelector } from 'calypso/state';
import { recordTracksEventWithClientId } from 'calypso/state/analytics/actions';
import { getCurrentOAuth2Client } from 'calypso/state/oauth2-clients/ui/selectors';
import getCurrentLocaleSlug from 'calypso/state/selectors/get-current-locale-slug';
import getCurrentQueryArguments from 'calypso/state/selectors/get-current-query-arguments';
import getCurrentRoute from 'calypso/state/selectors/get-current-route';
import getInitialQueryArguments from 'calypso/state/selectors/get-initial-query-arguments';

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
	const initialQuery = useSelector( getInitialQueryArguments );
	const currentQuery = useSelector( getCurrentQueryArguments );
	const currentRoute = useSelector( getCurrentRoute );
	const oauth2Client = useSelector( getCurrentOAuth2Client );
	const locale = useSelector( getCurrentLocaleSlug );

	// Signup sets the marker and the address together, so read both from the same
	// snapshot: the initial query outlives the navigation that carried them.
	const sourceQuery = currentQuery?.is_signup_existing_account ? currentQuery : initialQuery;

	if ( ! sourceQuery?.is_signup_existing_account ) {
		return null;
	}

	const address = sourceQuery.email_address;
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
