import { useSelector } from 'calypso/state';
import isEligibleForSubscriberImporter from 'calypso/state/selectors/is-eligible-for-subscriber-importer';

export function useIsEligibleSubscriberImporter() {
	return useSelector( isEligibleForSubscriberImporter );
}
