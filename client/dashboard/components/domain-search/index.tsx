// eslint-disable-next-line no-restricted-imports
import { DomainSearch } from '@automattic/domain-search';
import { __ } from '@wordpress/i18n';
import { useWPCOMShoppingCartForDomainSearch } from '../../app/shopping-cart';
import { PageHeader } from '../page-header';
import PageLayout from '../page-layout';

import './style.scss';

interface DashboardDomainSearchProps {
	currentSiteId?: number;
	currentSiteUrl?: string;
}

function DashboardDomainSearch( { currentSiteId, currentSiteUrl }: DashboardDomainSearchProps ) {
	const cart = useWPCOMShoppingCartForDomainSearch( {
		cartKey: currentSiteId ?? 'no-site',
	} );

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
			<DomainSearch
				cart={ cart }
				className="dashboard-domain-search"
				currentSiteUrl={ currentSiteUrl }
			/>
		</PageLayout>
	);
}

export default DashboardDomainSearch;
