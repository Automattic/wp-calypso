import { useSupportAvailability } from '../data/use-support-availability';

export function useShouldRenderEmailOption() {
	const { data: supportAvailability, isFetching } = useSupportAvailability( 'OTHER' );

	return {
		isLoading: isFetching,
		render: supportAvailability?.is_user_eligible_for_tickets ?? false,
	};
}
