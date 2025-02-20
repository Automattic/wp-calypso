import { isDIFMFlow, isHundredYearDomainFlow, isHundredYearPlanFlow } from '@automattic/onboarding';

export function useGetZendeskFieldsByFlow( flow: string ) {
	const url = window.location?.href;

	if ( isDIFMFlow( flow ) ) {
		return {
			initialMessage: `User is purchasing DIFM plan. ${ url ? ` URL: ${ url }` : '' }`,
			product: 'DIFM flow',
		};
	} else if ( isHundredYearPlanFlow( flow ) ) {
		return {
			initialMessage: `User is purchasing 100 year plan. ${ url ? ` URL: ${ url }` : '' }`,
		};
	} else if ( isHundredYearDomainFlow( flow ) ) {
		return {
			initialMessage: `User is purchasing domain. ${ url ? ` URL: ${ url }` : '' }`,
		};
	}

	return null;
}
