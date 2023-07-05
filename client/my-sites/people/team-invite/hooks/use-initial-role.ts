import { useSelector } from 'calypso/state';
import getCurrentQueryArguments from 'calypso/state/selectors/get-current-query-arguments';
import isEligibleForSubscriberImporter from 'calypso/state/selectors/is-eligible-for-subscriber-importer';
import isSiteAutomatedTransfer from 'calypso/state/selectors/is-site-automated-transfer';
import isSiteWPForTeams from 'calypso/state/selectors/is-site-wpforteams';

export function useInitialRole( siteId: number ) {
	const queryParameterRole = useSelector( ( state ) => getCurrentQueryArguments( state )?.role );
	const isAtomic = useSelector( ( state ) => isSiteAutomatedTransfer( state, siteId ) );
	const isSiteForTeams = useSelector( ( state ) => isSiteWPForTeams( state, siteId ) );
	const includeSubscriberImporter = useSelector( isEligibleForSubscriberImporter );

	if ( typeof queryParameterRole === 'string' ) {
		return queryParameterRole;
	}

	let role;
	if ( includeSubscriberImporter ) {
		role = 'editor';
	} else {
		role = 'follower';

		if ( isSiteForTeams ) {
			role = 'editor';
		} else if ( isAtomic ) {
			role = 'subscriber';
		}
	}

	return role;
}
