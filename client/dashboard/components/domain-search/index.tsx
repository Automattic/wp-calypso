// eslint-disable-next-line no-restricted-imports
import { DomainSearch } from '@automattic/domain-search';
// eslint-disable-next-line no-restricted-imports
import { ShoppingCartProvider } from '@automattic/shopping-cart';
import { __ } from '@wordpress/i18n';
import { ComponentProps } from 'react';
import {
	shoppingCartManagerClient,
	useWPCOMShoppingCartForDomainSearch,
} from '../../app/shopping-cart';
import { PageHeader } from '../page-header';
import PageLayout from '../page-layout';

import './style.scss';

interface DashboardDomainSearchProps {
	currentSiteId?: number;
	currentSiteUrl?: string;
}

function DomainSearchWithCart( {
	currentSiteId,
	...props
}: Omit< ComponentProps< typeof DomainSearch >, 'cart' > & { currentSiteId?: number } ) {
	const cart = useWPCOMShoppingCartForDomainSearch( {
		cartKey: currentSiteId ?? 'no-site',
	} );

	return <DomainSearch className="dashboard-domain-search" { ...props } cart={ cart } />;
}

function DashboardDomainSearch( props: DashboardDomainSearchProps ) {
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
			<ShoppingCartProvider managerClient={ shoppingCartManagerClient }>
				<DomainSearchWithCart { ...props } />
			</ShoppingCartProvider>
		</PageLayout>
	);
}

export default DashboardDomainSearch;
