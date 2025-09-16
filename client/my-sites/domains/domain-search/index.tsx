import { WPCOMDomainSearch } from 'calypso/components/domains/wpcom-domain-search';
import { getSuggestionsVendor } from 'calypso/lib/domains/suggestions';
import { useSelector } from '../../../state';
import getCurrentQueryArguments from '../../../state/selectors/get-current-query-arguments';

export default function DomainSearch() {
	const queryArguments = useSelector( getCurrentQueryArguments );

	const allowedTlds = Array.isArray( queryArguments?.tld )
		? queryArguments.tld
		: queryArguments?.tld?.split( ',' ) ?? [];

	return (
		<WPCOMDomainSearch
			flowName="domains"
			config={ {
				vendor: getSuggestionsVendor( {
					isSignup: false,
					isDomainOnly: false,
					flowName: 'domains',
				} ),
				allowedTlds,
			} }
		/>
	);
}
