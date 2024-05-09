import { useSupportAvailability } from '../data/use-support-availability';

export function useShouldRenderEmailOption() {
	const { data: supportAvailability, isFetching } = useSupportAvailability( 'EMAIL' );

	return {
		isLoading: isFetching,
		render: supportAvailability?.is_email_contact_enabled ?? false,
	};
}
