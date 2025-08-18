// eslint-disable-next-line no-restricted-imports
import { DomainSearch } from '@automattic/domain-search';
import PageLayout from '../../components/page-layout';

export default function DomainPurchase() {
	return (
		<PageLayout>
			<DomainSearch
				cart={ {
					items: [],
					total: '',
					onAddItem: () => Promise.resolve(),
					onRemoveItem: () => Promise.resolve(),
					hasItem: () => false,
				} }
			/>
		</PageLayout>
	);
}
