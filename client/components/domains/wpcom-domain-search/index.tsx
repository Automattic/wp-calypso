import { DomainSearch } from '@automattic/domain-search';

export const WPCOMDomainSearch = () => {
	return (
		<DomainSearch
			cart={ {
				items: [],
				total: '',
				onAddItem: () => Promise.resolve(),
				onRemoveItem: () => Promise.resolve(),
				hasItem: () => false,
			} }
		/>
	);
};
