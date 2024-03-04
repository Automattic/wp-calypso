import config from '@automattic/calypso-config';
import { useQuery } from '@tanstack/react-query';

export default function useFetchLicenseCounts() {
	const showDummyData = config.isEnabled( 'a4a/mock-api-data' );

	const getLicenseCounts = () => {
		if ( showDummyData ) {
			return {
				attached: 1,
				detached: 1,
				revoked: 0,
				not_revoked: 2,
				standard: 0,
				all: 2,
				products: {},
			};
		}
		return {
			attached: 0,
			detached: 0,
			revoked: 0,
			not_revoked: 0,
			standard: 0,
			all: 0,
			products: {},
		}; // FIXME: This is a placeholder for the actual API call.
	};

	return useQuery( {
		queryKey: [ 'a4a-license-counts' ],
		queryFn: () => getLicenseCounts(),
	} );
}
