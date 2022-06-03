import { useSupportAvailability } from '@automattic/data-stores';

export function useShouldRenderEmailOption() {
	const { data: supportAvailability } = useSupportAvailability( 'OTHER' );
	if (
		supportAvailability?.is_user_eligible_for_kayako ||
		supportAvailability?.is_user_eligible_for_upwork
	) {
		return true;
	}
	return false;
}
