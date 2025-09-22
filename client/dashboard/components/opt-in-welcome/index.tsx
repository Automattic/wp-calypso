import { userPreferenceQuery, userPreferenceMutation } from '@automattic/api-queries';
import { useMutation, useSuspenseQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { starEmpty } from '@wordpress/icons';
import Notice from '../../components/notice';

export function OptInWelcome() {
	const { data: isDismissedPersisted } = useSuspenseQuery(
		userPreferenceQuery( 'hosting-dashboard-welcome-notice-dismissed' )
	);
	const { mutate: dismiss, isPending: isDismissing } = useMutation(
		userPreferenceMutation( 'hosting-dashboard-welcome-notice-dismissed' )
	);

	// Optimistically hide the banner assuming the preference will get saved.
	if ( isDismissing || isDismissedPersisted ) {
		return null;
	}

	return (
		<Notice onClose={ () => dismiss( new Date().toISOString() ) } variant="info" icon={ starEmpty }>
			{ createInterpolateElement(
				__(
					'Welcome to your new hosting dashboard. To switch back to the previous version, go to <preferencesLink>Preferences</preferencesLink>.'
				),
				{
					preferencesLink: <Link to="/me/preferences" />,
				}
			) }
		</Notice>
	);
}
