const FLOWS_INITIAL_MESSAGES = {
	'difm-flow': 'User is purchasing DIFM plan.',
	'difm-flow-store': 'User is purchasing DIFM store plan.',
	'website-design-services': 'User is purchasing DIFM website design services.',
	'hundred-year-plan-flow': 'User is purchasing 100 year plan.',
	'hundred-year-domain-flow': 'User is purchasing 100 year domain.',
};

const FLOWS_FLOWNAME = {
	'difm-flow': 'dotcom_difm',
	'difm-flow-store': 'dotcom_difm',
	'website-design-services': 'dotcom_difm',
};

export function getZendeskUserFieldsByFlow( flowName: string ) {
	const url = window.location.href;
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
