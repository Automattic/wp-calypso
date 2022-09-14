import { isEligibleForProductSampling } from 'calypso/utils';

export function includeSubscriberImporterGradually( userId, isA8cTeamMember ) {
	const USERS_PERCENTAGE = 1; // % of users eligible for product sampling

	if ( isA8cTeamMember ) return true;

	return isEligibleForProductSampling( userId, USERS_PERCENTAGE );
}
