import { UrlFriendlyTermType } from '@automattic/calypso-products';
import { getUrlParts } from '@automattic/calypso-url';
import { isOnboardingGuidedFlow } from '@automattic/onboarding';

type SupportedIntervalTypes = Extract<
	UrlFriendlyTermType,
	'monthly' | 'yearly' | '2yearly' | '3yearly'
>;
const supportedIntervalTypes: SupportedIntervalTypes[] = [
	'monthly',
	'yearly',
	'2yearly',
	'3yearly',
];

export const getIntervalType = ( path?: string ): SupportedIntervalTypes => {
	const url = path ?? window?.location?.href ?? '';
	const intervalType = getUrlParts( url ).searchParams.get( 'intervalType' ) || 'yearly';

	return (
		supportedIntervalTypes.includes( intervalType as SupportedIntervalTypes )
			? intervalType
			: 'yearly'
	) as SupportedIntervalTypes;
};

export const shouldBasePlansOnSegment = (
	flowName: string,
	trailMapExperimentVariant: undefined | null | 'treatment_guided' | 'treatment_survey_only'
): boolean => {
	return isOnboardingGuidedFlow( flowName ) && trailMapExperimentVariant === 'treatment_guided';
};
