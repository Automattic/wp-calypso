import { UserLicensesDialog } from './user-licenses-dialog';
import type { ProductStoreProps } from './types';

const ProductStore: React.FC< ProductStoreProps > = ( { enableUserLicensesDialog } ) => {
	return <div>{ ( enableUserLicensesDialog || 'ok' ) && <UserLicensesDialog /> }</div>;
};

export default ProductStore;
