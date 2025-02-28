import {
	DIFM_FLOW,
	DIFM_FLOW_STORE,
	HUNDRED_YEAR_DOMAIN_FLOW,
	HUNDRED_YEAR_PLAN_FLOW,
	WEBSITE_DESIGN_SERVICES,
} from '@automattic/onboarding';

const FLOWS_INITIAL_MESSAGES = {
	[ DIFM_FLOW ]: 'User is purchasing DIFM plan.',
	[ DIFM_FLOW_STORE ]: 'User is purchasing DIFM store plan.',
	[ WEBSITE_DESIGN_SERVICES ]: 'User is purchasing DIFM website design services.',
	[ HUNDRED_YEAR_PLAN_FLOW ]: 'User is purchasing 100 year plan.',
	[ HUNDRED_YEAR_DOMAIN_FLOW ]: 'User is purchasing 100 year domain.',
};

const FLOWS_FLOWNAME = {
	[ DIFM_FLOW ]: 'messaging_flow_dotcom_difm',
	[ DIFM_FLOW_STORE ]: 'messaging_flow_dotcom_difm',
	[ WEBSITE_DESIGN_SERVICES ]: 'messaging_flow_dotcom_difm',
};

// We want to give the Help Center custom options based on the flow in which the user is in
export function useFlowZendeskUserFields( flowName: string ) {
	const url = window?.location.href;
	let userFieldFlowName = null;
	let userFieldMessage = null;

	if ( Object.keys( FLOWS_INITIAL_MESSAGES ).includes( flowName ) ) {
		userFieldMessage = `${
			FLOWS_INITIAL_MESSAGES[ flowName as keyof typeof FLOWS_INITIAL_MESSAGES ]
		} URL: ${ url }`;
	}

	if ( Object.keys( FLOWS_FLOWNAME ).includes( flowName ) ) {
		userFieldFlowName = FLOWS_FLOWNAME[ flowName as keyof typeof FLOWS_FLOWNAME ];
	}

	return {
		userFieldMessage,
		userFieldFlowName,
	};
}
