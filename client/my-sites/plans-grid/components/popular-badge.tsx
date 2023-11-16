import { getPlanClass, PlanSlug } from '@automattic/calypso-products';
import classNames from 'classnames';
import PlanPill from 'calypso/my-sites/plans-grid/components/shared/plan-pill';
import { usePlansGridContext } from '../grid-context';

const PopularBadge: React.FunctionComponent< {
	isInSignup?: boolean;
	planSlug: PlanSlug;
	additionalClassName?: string;
} > = ( { isInSignup, planSlug, additionalClassName } ) => {
	const { gridPlansIndex } = usePlansGridContext();
	const classes = classNames(
		'plan-features-2023-grid__popular-badge',
		getPlanClass( planSlug ),
		additionalClassName
	);
	const highlightLabel = gridPlansIndex[ planSlug ]?.highlightLabel;

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
