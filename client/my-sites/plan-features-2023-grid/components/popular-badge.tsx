import { getPlanClass } from '@automattic/calypso-products';
import classNames from 'classnames';
import PlanPill from 'calypso/components/plans/plan-pill';
import useHighlightLabel from '../hooks/use-highlight-label';

const PopularBadge: React.FunctionComponent< {
	isInSignup: boolean;
	planName: string;
	flowName: string;
	additionalClassName?: string;
} > = ( { isInSignup, planName, additionalClassName, flowName } ) => {
	const classes = classNames(
		'plan-features-2023-grid__popular-badge',
		getPlanClass( planName ),
		additionalClassName
	);
	const highlightLabel = useHighlightLabel( planName, flowName );

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
