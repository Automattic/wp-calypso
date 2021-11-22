import {
	getForCurrentCROIteration,
	Iterations,
} from 'calypso/my-sites/plans/jetpack-plans/iterations';
import CardWithPrice, { CardWithPriceProps } from './with-price';
import CardWithoutPrice, { CardWithoutPriceProps } from './without-price';

const Wrapper: React.FC< CardWithPriceProps | CardWithoutPriceProps > = ( props ) => {
	return getForCurrentCROIteration( ( iteration: Iterations ) => {
		if ( iteration === Iterations.ONLY_REALTIME_PRODUCTS ) {
			return <CardWithPrice { ...props } />;
		}

		return <CardWithoutPrice { ...props } />;
	} );
};

export default Wrapper;
