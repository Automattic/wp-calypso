import { pickBy } from 'lodash';

import 'calypso/state/products-list/init';

export function getAvailableProductsList( state ) {
	return pickBy( state.productsList.items, ( product ) => product.available );
}
