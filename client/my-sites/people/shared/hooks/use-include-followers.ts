import { useSelector } from 'calypso/state';
import isEligibleForSubscriberImporter from 'calypso/state/selectors/is-eligible-for-subscriber-importer';
import isPrivateSite from 'calypso/state/selectors/is-private-site';
import isSiteAutomatedTransfer from 'calypso/state/selectors/is-site-automated-transfer';

export function useIncludeFollowers( siteId: number ) {
	const isAtomic = useSelector( ( state ) => isSiteAutomatedTransfer( state, siteId ) );
	const isPrivate = useSelector( ( state ) => isPrivateSite( state, siteId ) );
	const includeSubscriberImporter = useSelector( isEligibleForSubscriberImporter );

	if ( includeSubscriberImporter ) {
		return isPrivate && ! isAtomic;
	}

	// Atomic private sites don't support Viewers/Followers.
	// @see https://github.com/Automattic/wp-calypso/issues/43919
	return ! isAtomic;
}
