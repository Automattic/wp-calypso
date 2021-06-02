/**
 * External dependencies
 */
import { useQuery } from 'react-query';

/**
 * Internal dependencies
 */
import wpcom from 'calypso/lib/wp';

const useHappinessEngineersQuery = () =>
	useQuery( 'happinessEngineers', async () => await wpcom.undocumented().getHappinessEngineers(), {
		refetchOnWindowFocus: false,
	} );

export default useHappinessEngineersQuery;
