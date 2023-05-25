import { useQuery } from '@tanstack/react-query';
import wp from 'calypso/lib/wp';

const useAppPasswordsQuery = () =>
	useQuery( {
		queryKey: [ 'application-passwords' ],
		queryFn: () => wp.req.get( '/me/two-step/application-passwords' ),
		refetchOnWindowFocus: false,
		select( data ) {
			return data.application_passwords;
		},
	} );

export default useAppPasswordsQuery;
