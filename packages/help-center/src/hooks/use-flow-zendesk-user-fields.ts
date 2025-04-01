import { FLOWS_ZENDESK_FLOWNAME, FLOWS_ZENDESK_INITIAL_MESSAGES } from '../constants';

// We want to give the Help Center custom options based on the flow in which the user is in
export function useFlowZendeskUserFields( flowName: string ) {
	const url = window?.location.href;
	let userFieldFlowName = null;
	let userFieldMessage = null;

	if ( Object.keys( FLOWS_ZENDESK_INITIAL_MESSAGES ).includes( flowName ) ) {
		userFieldMessage = `${
			FLOWS_ZENDESK_INITIAL_MESSAGES[ flowName as keyof typeof FLOWS_ZENDESK_INITIAL_MESSAGES ]
		} URL: ${ url }`;
	}

	if ( Object.keys( FLOWS_ZENDESK_FLOWNAME ).includes( flowName ) ) {
		userFieldFlowName = FLOWS_ZENDESK_FLOWNAME[ flowName as keyof typeof FLOWS_ZENDESK_FLOWNAME ];
	}

	return {
		userFieldMessage,
		userFieldFlowName,
	};
}
