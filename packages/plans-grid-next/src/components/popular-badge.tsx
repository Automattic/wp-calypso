import { getPlanClass, PlanSlug } from '@automattic/calypso-products';
import clsx from 'clsx';
import { usePlansGridContext } from '../grid-context';
import PlanPill from './shared/plan-pill';

const PopularBadge: React.FunctionComponent< {
	isInSignup?: boolean;
	planSlug: PlanSlug;
	additionalClassName?: string;
} > = ( { isInSignup, planSlug, additionalClassName } ) => {
	const { gridPlansIndex } = usePlansGridContext();
	const classes = clsx(
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
