import { TERM_ANNUALLY } from '@automattic/calypso-products';
import { __ } from '@wordpress/i18n';
import { BlockPlan } from './pricing-plans';

const getPlanLabel = ( plan: BlockPlan ): string => {
	const title = plan.getTitle().toString();

	const period =
		plan.term === TERM_ANNUALLY ? __( 'annually', 'happy-tools' ) : __( 'monthly', 'happy-tools' );

	return `${ title } (${ period })`;
};

const usePlanOptions = ( plans: BlockPlan[] ) => {
	const options = plans.map( ( plan ) => ( {
		label: getPlanLabel( plan ),
		value: plan.productSlug,
	} ) );

	return options;
};

export default usePlanOptions;
