import { useSelector } from 'react-redux';
import getCurrentQueryArguments from 'calypso/state/selectors/get-current-query-arguments';

/**
 * Returns the plan slug from the current query arguments `?plan=` that is normally used in upsells.
 * @returns {string|null|undefined} The plan slug.
 */
const usePlanFromUpsells = (): string | null | undefined => {
	const currentQueryArguments = useSelector( getCurrentQueryArguments );

	return Array.isArray( currentQueryArguments?.plan )
		? currentQueryArguments?.plan[ 0 ]
		: currentQueryArguments?.plan;
};

export default usePlanFromUpsells;
