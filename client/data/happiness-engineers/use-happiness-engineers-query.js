import { useQuery } from 'react-query';
import wpcom from 'calypso/lib/wp';

const useHappinessEngineersQuery = () =>
	useQuery( 'happinessEngineers', async () => await wpcom.req.get( '/meta/happiness-engineers/' ), {
		refetchOnWindowFocus: false,
	} );

export default useHappinessEngineersQuery;
