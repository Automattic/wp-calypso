import { useSupportStatus } from '../data/use-support-status';

export function useShouldRenderEmailOption() {
	const { data: supportStatus, isFetching } = useSupportStatus();

	return {
		isLoading: isFetching,
		render: Boolean( supportStatus?.availability.force_email_support ),
	};
}
