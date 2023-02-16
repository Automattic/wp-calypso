import { getPlanClass } from '@automattic/calypso-products';
import classNames from 'classnames';
import PlanPill from 'calypso/components/plans/plan-pill';
import useFeaturedLabel from '../hooks/use-featured-label';

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
	const featuredLabel = useFeaturedLabel( planName );

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
