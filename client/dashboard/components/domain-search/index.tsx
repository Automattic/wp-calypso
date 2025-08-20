// eslint-disable-next-line no-restricted-imports
import { DomainSearch } from '@automattic/domain-search';
import { __ } from '@wordpress/i18n';
import { PageHeader } from '../page-header';
import PageLayout from '../page-layout';

import './style.scss';

const staticCart = {
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
};

function DashboardDomainSearch() {
	return (
		<PageLayout
			size="large"
			header={
				<PageHeader
					title={ __( 'Claim your space on the web' ) }
					description={ __( 'Make it yours with a .com, .blog or one of 350+ domain options.' ) }
				/>
			}
		>
			<DomainSearch className="dashboard-domain-search" cart={ staticCart } />
		</PageLayout>
	);
}

export default DashboardDomainSearch;
