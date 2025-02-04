import { BlockPlan } from './pricing-plans';

const usePlanOptions = ( plans: BlockPlan[] ) => {
	const options = plans.map( ( plan ) => ( {
		label: plan.productNameShort,
		value: plan.type,
	} ) );

	const uniqueOptions = [
		...new Map( options.map( ( option ) => [ option.value, option ] ) ).values(),
	];

	return uniqueOptions;
};

export default usePlanOptions;
