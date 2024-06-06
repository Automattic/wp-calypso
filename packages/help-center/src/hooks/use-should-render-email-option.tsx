import { useSupportAvailability } from '../data/use-support-availability';

export function useShouldRenderEmailOption() {
	const { data: supportAvailability, isFetching } = useSupportAvailability();

	// Domain only customers should always see the email option
	// Domain only users have this combination of support level === free, and is_user_eligible === true.
	const isDomainOnlyUser =
		supportAvailability?.is_user_eligible && supportAvailability?.supportLevel === 'free';

	return {
		isLoading: isFetching,
		render: isDomainOnlyUser || ( supportAvailability?.force_email_contact_form ?? false ),
	};
}
