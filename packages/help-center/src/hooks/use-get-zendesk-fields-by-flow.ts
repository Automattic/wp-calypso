import { isDIFMFlow, isHundredYearDomainFlow, isHundredYearPlanFlow } from '@automattic/onboarding';

export function useGetZendeskFieldsByFlow( flowName: string ) {
	const url = window.location?.href;

	if ( isDIFMFlow( flowName ) ) {
		return {
			initialMessage: `User is purchasing DIFM plan. ${ url ? ` URL: ${ url }` : '' }`,
		};
	} else if ( isHundredYearPlanFlow( flowName ) ) {
		return {
			initialMessage: `User is purchasing 100 year plan. ${ url ? ` URL: ${ url }` : '' }`,
		};
	} else if ( isHundredYearDomainFlow( flowName ) ) {
		return {
			initialMessage: `User is purchasing domain. ${ url ? ` URL: ${ url }` : '' }`,
		};
	}

	return null;
}
