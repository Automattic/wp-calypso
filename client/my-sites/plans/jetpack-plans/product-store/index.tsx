import { useSelector } from 'react-redux';
import StoreFooter from 'calypso/jetpack-connect/store-footer';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { JetpackFree } from './jetpack-free';
import { Recommendations } from './recommendations';
import { UserLicensesDialog } from './user-licenses-dialog';
import type { ProductStoreProps } from './types';

import './style.scss';

const ProductStore: React.FC< ProductStoreProps > = ( {
	enableUserLicensesDialog,
	urlQueryArgs,
} ) => {
	const siteId = useSelector( getSelectedSiteId );

	return (
		<div className="jetpack-product-store">
			{ enableUserLicensesDialog && <UserLicensesDialog siteId={ siteId } /> }
			<JetpackFree urlQueryArgs={ urlQueryArgs } siteId={ siteId } />
			<Recommendations />
			<StoreFooter />
		</div>
	);
};

export default ProductStore;
