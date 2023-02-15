import { isBusinessPlan, isEcommercePlan, isPremiumPlan } from '@automattic/calypso-products';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import PlanPill from 'calypso/components/plans/plan-pill';

const PopularBadge: React.FunctionComponent< {
	isInSignup: boolean;
	planName: string;
	additionalClassName?: string;
} > = ( { isInSignup, planName, additionalClassName } ) => {
	const translate = useTranslate();
	const classes = classNames( 'plan-features-2023-grid__popular-badge', additionalClassName );

	let featuredLabel;

	if ( isBusinessPlan( planName ) ) {
		featuredLabel = translate( 'Best for devs' );
	} else if ( isEcommercePlan( planName ) ) {
		featuredLabel = translate( 'Best for stores' );
	} else if ( isPremiumPlan( planName ) ) {
		featuredLabel = translate( 'Popular' );
	}

	return (
		<>
			{ featuredLabel && (
				<div className={ classes }>
					<PlanPill isInSignup={ isInSignup }>{ featuredLabel }</PlanPill>
				</div>
			) }
		</>
	);
};

export default PopularBadge;
