import StoreFooter from 'calypso/jetpack-connect/store-footer';
import { UserLicensesDialog } from './user-licenses-dialog';
import type { ProductStoreProps } from './types';

const ProductStore: React.FC< ProductStoreProps > = ( { enableUserLicensesDialog } ) => {
	return (
		<div>
			{ enableUserLicensesDialog && <UserLicensesDialog /> }
			<StoreFooter />
		</div>
	);
};

export default ProductStore;
