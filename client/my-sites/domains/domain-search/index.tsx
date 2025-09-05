import { WPCOMDomainSearch } from 'calypso/components/domains/wpcom-domain-search';
import { getSuggestionsVendor } from 'calypso/lib/domains/suggestions';

export default function DomainSearch() {
	return (
		<WPCOMDomainSearch
			flowName="domains"
			config={ {
				vendor: getSuggestionsVendor( {
					isSignup: false,
					isDomainOnly: false,
					flowName: 'domains',
				} ),
			} }
		/>
	);
}
