import { Button, CheckoutStepBody } from '@automattic/composite-checkout';
import { useTranslate } from 'i18n-calypso';
import { useEffect } from 'react';
import { login } from 'calypso/lib/paths';
import { useSelector, useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { redirectToLogout } from 'calypso/state/current-user/actions';
import { getCurrentUser } from 'calypso/state/current-user/selectors';

export function WrongAccountRenewal() {
	const reduxDispatch = useDispatch();
	useEffect( () => {
		reduxDispatch( recordTracksEvent( 'calypso_checkout_wrong_account_renewal' ) );
	}, [ reduxDispatch ] );

	return (
		<CheckoutStepBody
			stepId="wrong-account-renewal"
			isStepActive={ false }
			isStepComplete
			titleContent={ <WrongAccountRenewalTitle /> }
			completeStepContent={ <WrongAccountRenewalExplanation /> }
		/>
	);
}

function WrongAccountRenewalTitle() {
	const translate = useTranslate();
	return <>{ String( translate( 'This subscription belongs to a different account' ) ) }</>;
}

function WrongAccountRenewalExplanation() {
	const translate = useTranslate();
	const username = useSelector( getCurrentUser )?.username;

	if ( ! username ) {
		return (
			<>
				{ translate(
					'The subscription you are trying to renew was purchased with a different WordPress.com account. Log in to that account to renew it.'
				) }
			</>
		);
	}

	return (
		<>
			{ translate(
				'The subscription you are trying to renew was purchased with a different WordPress.com account. You are currently logged in as {{strong}}%(username)s{{/strong}}, so log in to the account that purchased it to renew it.',
				{
					args: { username },
					components: { strong: <strong /> },
				}
			) }
		</>
	);
}

/**
 * Logs the customer out and sends them to the login page, which will return
 * them to this checkout page once they have logged in to the right account.
 */
export function LogInToCorrectAccountButton() {
	const translate = useTranslate();
	const reduxDispatch = useDispatch();

	return (
		<Button
			buttonType="primary"
			fullWidth
			onClick={ () => {
				reduxDispatch( recordTracksEvent( 'calypso_checkout_wrong_account_renewal_login_click' ) );
				reduxDispatch( redirectToLogout( login( { redirectTo: window.location.href } ) ) );
			} }
		>
			{ translate( 'Log in to the right account' ) }
		</Button>
	);
}
