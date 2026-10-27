import { TextBlur } from '../../../components/text-blur';
import { isPressableSite } from '../lib';
import { usePressableSitesPlan } from '../use-pressable-sites-plan';
import type { AgencySite } from '@automattic/api-core';
import type { Field } from '@wordpress/dataviews';
import type { ComponentProps, ComponentType } from 'react';

type PlanCellProps = ComponentProps< NonNullable< Field< AgencySite >[ 'render' ] > >;

// A Pressable site shows the agency's Pressable plan, as on its overview, not
// its own plan (often a Jetpack license).
function PressablePlanCell( {
	SharedPlanCell,
	...props
}: PlanCellProps & { SharedPlanCell: ComponentType< PlanCellProps > } ) {
	const { plan, isReady } = usePressableSitesPlan();

	// One wrapper throughout, with only its content changing: the plan arrives
	// after first paint, and swapping elements across that boundary crashes
	// under Google Translate (react/react#11538).
	return (
		<span>
			{ ! isReady ? (
				<TextBlur isBlurred length={ 6 }>
					-
				</TextBlur>
			) : (
				( plan?.name ?? <SharedPlanCell { ...props } /> )
			) }
		</span>
	);
}

export function withPressablePlan( field: Field< AgencySite > | null ): Field< AgencySite > | null {
	if ( ! field?.render ) {
		return field;
	}
	const SharedPlanCell: ComponentType< PlanCellProps > = field.render;

	function PlanCell( props: PlanCellProps ) {
		if ( ! isPressableSite( props.item ) ) {
			return <SharedPlanCell { ...props } />;
		}
		return <PressablePlanCell { ...props } SharedPlanCell={ SharedPlanCell } />;
	}

	return { ...field, render: PlanCell };
}
