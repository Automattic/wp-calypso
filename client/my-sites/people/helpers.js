import { isEnabled } from '@automattic/calypso-config';
import { isEligibleForProductSampling } from 'calypso/utils';

export function includeSubscriberImporterGradually( userId, isA8cTeamMember ) {
	const USERS_PERCENTAGE = 1; // % of users eligible for product sampling

	if ( isEnabled( 'subscriber-importer' ) && isA8cTeamMember ) return true;

	return (
		isEnabled( 'subscriber-importer' ) && isEligibleForProductSampling( userId, USERS_PERCENTAGE )
	);
}
