import { DIFM_FLOW, DIFM_FLOW_STORE, WEBSITE_DESIGN_SERVICES } from '@automattic/onboarding';
import { useSupportStatus } from '../data/use-support-status';

// We want to give the Help Center custom options based on the flow in which the user is in
export function useFlowCustomOptions( flowName: string ) {
	const { data: supportStatus } = useSupportStatus();

	if (
		flowName === DIFM_FLOW ||
		flowName === DIFM_FLOW_STORE ||
		flowName === WEBSITE_DESIGN_SERVICES
	) {
		return {
			hideBackButton: true,
			hasPremiumSupport: Boolean( supportStatus?.availability.is_difm_chat_open ),
		};
	}

	return null;
}
