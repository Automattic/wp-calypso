import {
	DIFM_FLOW,
	DIFM_FLOW_STORE,
	HUNDRED_YEAR_PLAN_FLOW,
	HUNDRED_YEAR_DOMAIN_FLOW,
	WEBSITE_DESIGN_SERVICES,
} from '@automattic/onboarding';

const FLOWS_INITIAL_MESSAGES = {
	[ DIFM_FLOW ]: 'User is purchasing DIFM plan.',
	[ DIFM_FLOW_STORE ]: 'User is purchasing DIFM store plan.',
	[ WEBSITE_DESIGN_SERVICES ]: 'User is purchasing DIFM website design services.',
	[ HUNDRED_YEAR_PLAN_FLOW ]: 'User is purchasing 100 year plan.',
	[ HUNDRED_YEAR_DOMAIN_FLOW ]: 'User is purchasing 100 year domain.',
};

export function getZendeskInitialMessageByFlow( flowName: string ) {
	const url = window.location.href;

	if ( Object.keys( FLOWS_INITIAL_MESSAGES ).includes( flowName ) ) {
		return `${
			FLOWS_INITIAL_MESSAGES[ flowName as keyof typeof FLOWS_INITIAL_MESSAGES ]
		} URL: ${ url } }`;
	}

	return null;
}
