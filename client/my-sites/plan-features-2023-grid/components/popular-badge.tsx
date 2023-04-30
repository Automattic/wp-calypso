import { getPlanClass } from '@automattic/calypso-products';
import classNames from 'classnames';
import PlanPill from 'calypso/components/plans/plan-pill';
import useHighlightLabel from '../hooks/use-highlight-label';

// @todo npm-migration
// migrate PlanPill to @automattic/components
// is getPlanClass needed? then migrate to data store

const PopularBadge: React.FunctionComponent< {
	isInSignup: boolean;
	planName: string;
	additionalClassName?: string;
} > = ( { isInSignup, planName, additionalClassName } ) => {
	const classes = classNames(
		'plan-features-2023-grid__popular-badge',
		getPlanClass( planName ),
		additionalClassName
	);
	const highlightLabel = useHighlightLabel( planName );

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
