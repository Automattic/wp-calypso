import { getPlanClass, PlanSlug } from '@automattic/calypso-products';
import classNames from 'classnames';
import PlanPill from 'calypso/components/plans/plan-pill';
import { usePlansGridContext } from '../grid-context';

const PopularBadge: React.FunctionComponent< {
	isInSignup?: boolean;
	planName: PlanSlug;
	additionalClassName?: string;
} > = ( { isInSignup, planName, additionalClassName } ) => {
	const { planRecords } = usePlansGridContext();
	const classes = classNames(
		'plan-features-2023-grid__popular-badge',
		getPlanClass( planName ),
		additionalClassName
	);
	const highlightLabel = planRecords[ planName ]?.highlightLabel;

	return (
		<>
			{ highlightLabel && (
				<div className={ classes }>
					<PlanPill isInSignup={ isInSignup }>{ highlightLabel }</PlanPill>
				</div>
			) }
		</>
	);
};

export default PopularBadge;
