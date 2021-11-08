import {
	getForCurrentCROIteration,
	Iterations,
} from 'calypso/my-sites/plans/jetpack-plans/iterations';
import Default, { DefaultProps } from './default';
import OnlyRealtimeProducts, { OnlyRealtimeProductsProps } from './only-realtime-products';

import './style.scss';

const ProductWithoutPrice: React.FC< DefaultProps | OnlyRealtimeProductsProps > = ( props ) =>
	getForCurrentCROIteration( {
		[ Iterations.ONLY_REALTIME_PRODUCTS ]: <OnlyRealtimeProducts { ...props } />,
	} ) ?? <Default { ...props } />;

export default ProductWithoutPrice;
