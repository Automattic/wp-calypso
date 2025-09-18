import { useMemo } from 'react';
import { WPCOMDomainSearch } from 'calypso/components/domains/wpcom-domain-search';
import { getSuggestionsVendor } from 'calypso/lib/domains/suggestions';
import { useSelector } from '../../../state';
import getCurrentQueryArguments from '../../../state/selectors/get-current-query-arguments';

export default function DomainSearch() {
	const flowName = 'domains';
	const queryArguments = useSelector( getCurrentQueryArguments );

	const tldQuery = queryArguments?.tld;

	const config = useMemo( () => {
		const allowedTlds = Array.isArray( tldQuery ) ? tldQuery : tldQuery?.split( ',' ) ?? [];

		return {
			vendor: getSuggestionsVendor( {
				isSignup: false,
				isDomainOnly: false,
				flowName,
			} ),
			allowedTlds,
			skippable: false,
		};
	}, [ flowName, tldQuery ] );

	return <WPCOMDomainSearch flowName={ flowName } config={ config } />;
}
