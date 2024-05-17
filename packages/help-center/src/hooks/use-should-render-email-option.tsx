import { useSupportAvailability } from '../data/use-support-availability';

export function useShouldRenderEmailOption() {
	const { data: supportAvailability, isFetching } = useSupportAvailability( 'EMAIL' );

	return {
		isLoading: isFetching,
		render: supportAvailability?.force_email_contact_form ?? false,
	};
}
