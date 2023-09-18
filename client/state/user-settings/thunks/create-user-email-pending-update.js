import { translate } from 'i18n-calypso';
import wp from 'calypso/lib/wp';
import { errorNotice, infoNotice } from 'calypso/state/notices/actions';
import 'calypso/state/user-settings/init';

/**
 * Redux thunk which exclusively updates the `email` setting.
 * @param {string} newEmail The new email address
 */
export const createUserEmailPendingUpdate = ( newEmail ) => async ( dispatch ) => {
	try {
		const { user_email_change_pending, new_user_email } = await wp
			.me()
			.settings()
			.update( { user_email: newEmail } );

		if ( user_email_change_pending ) {
			dispatch(
				infoNotice(
					translate(
						'There is a pending change of your WordPress.com email to %(newEmail)s. Please check your inbox for a confirmation link.',
						{
							args: { newEmail: new_user_email },
						}
					),
					{
						showDismiss: true,
						isPersistent: true,
					}
				)
			);
		}
	} catch ( error ) {
		dispatch(
			errorNotice(
				translate( 'There was a problem updating your WordPress.com Account email: %(error)s', {
					args: { error: error.message },
				} ),
				{
					showDismiss: true,
					isPersistent: true,
				}
			)
		);
	}
};
