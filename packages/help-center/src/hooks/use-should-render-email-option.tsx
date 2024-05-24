import { useSupportAvailability } from '../data/use-support-availability';

export function useShouldRenderEmailOption() {
	const { data: supportAvailability, isFetching } = useSupportAvailability();

	// Domain only customers should always see the email option
	// Domain only users have this combination of support level === free, and paying customer status.
	const isDomainOnlyUser =
		supportAvailability?.is_paying_customer && supportAvailability?.supportLevel === 'free';

	return {
		isLoading: isFetching,
		render: isDomainOnlyUser || ( supportAvailability?.force_email_contact_form ?? false ),
	};
}
