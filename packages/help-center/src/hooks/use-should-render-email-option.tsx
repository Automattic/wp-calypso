import { useSupportStatus } from '../data/use-support-status';

export function useShouldRenderEmailOption() {
	const { data: supportStatus, isFetching } = useSupportStatus();

	// Domain only customers should always see the email option
	// Domain only users have this combination of support level === free, and is_user_eligible === true.
	const isDomainOnlyUser =
		supportStatus?.eligibility.is_user_eligible &&
		supportStatus?.eligibility.support_level === 'free';

	return {
		isLoading: isFetching,
		render: isDomainOnlyUser || ( supportStatus?.availability.force_email_support ?? false ),
	};
}
