/**
 * External dependencies
 */
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Task from 'calypso/my-sites/customer-home/cards/tasks/task';
import { verifyEmail } from 'calypso/state/current-user/email-verification/actions';
import { getCurrentUserEmail } from 'calypso/state/current-user/selectors';

const VerifyEmail = (): React.ReactElement => {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const userEmail = useSelector( getCurrentUserEmail );

	return (
		<Task
			title={ translate( 'Confirm your email address' ) }
			description={ translate(
				'Please click the link in the email we sent to %(email)s. ' +
					'Typo in your email address? {{changeButton}}Change it here{{/changeButton}}.',
				{
					args: {
						email: userEmail,
					},
					components: {
						changeButton: <a href="/me/account" />,
					},
				}
			) }
			actionText={ translate( 'Resend email' ) }
			actionOnClick={ () => dispatch( verifyEmail( { showGlobalNotices: true } ) ) }
			badgeText={ translate( 'Action required' ) }
			showSkip={ false }
		/>
	);
};

export default VerifyEmail;
