import { userPreferenceOptimisticMutation, userPreferenceQuery } from '@automattic/api-queries';
import { useMutation, useQuery } from '@tanstack/react-query';
import { __, sprintf } from '@wordpress/i18n';
import { Notice } from '../../../components/notice';

// Shared with the classic dashboard so a dismissal carries over.
const DISMISS_PREFERENCE = 'a4a-pressable-plan-rename-notice-dismissed';

/** A dismissible notice telling the agency what its renamed plan used to be called. */
export default function PressableRenamedPlanNote( {
	formerName,
	name,
}: {
	formerName: string;
	name: string;
} ) {
	const { data: isDismissed, isFetched } = useQuery( userPreferenceQuery( DISMISS_PREFERENCE ) );
	const { mutate: saveDismissed } = useMutation(
		userPreferenceOptimisticMutation( DISMISS_PREFERENCE )
	);

	if ( ! isFetched || isDismissed ) {
		return null;
	}

	return (
		<Notice title={ __( 'Your plan has a new name' ) } onClose={ () => saveDismissed( true ) }>
			{ sprintf(
				/* translators: %1$s is the previous plan name, e.g. "Pressable Signature 2"; %2$s is the current plan name, e.g. "Pressable Standard 3". */
				__( '%1$s is now %2$s. Your price, features, sites, visits, and storage haven’t changed.' ),
				formerName,
				name
			) }
		</Notice>
	);
}
