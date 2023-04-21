import { useQuery } from 'react-query';
import wp from 'calypso/lib/wp';

const useAppPasswordsQuery = () =>
	useQuery( [ 'application-passwords' ], () => wp.req.get( '/me/two-step/application-passwords' ), {
		refetchOnWindowFocus: false,
		select( data ) {
			return data.application_passwords;
		},
	} );

export default useAppPasswordsQuery;
