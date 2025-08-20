// eslint-disable-next-line no-restricted-imports
import { DomainSearch } from '@automattic/domain-search';

function DashboardDomainSearch() {
	return (
		<DomainSearch
			cart={ {
				items: [
					{
						uuid: '1',
						domain: 'example',
						tld: 'com',
						price: '$10',
					},
					{
						uuid: '2',
						domain: 'example',
						tld: 'org',
						price: '$10',
					},
				],
				total: '$10',
				onAddItem: () => Promise.resolve(),
				onRemoveItem: () => Promise.resolve(),
				hasItem: () => false,
			} }
		/>
	);
}

export default DashboardDomainSearch;
