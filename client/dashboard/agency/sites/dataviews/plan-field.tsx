import { TextBlur } from '../../../components/text-blur';
import { isPressableSite } from '../lib';
import { useSitePressablePlan } from '../use-site-pressable-plan';
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
	const { plan, isReady } = useSitePressablePlan();

	if ( ! isReady ) {
		return (
			<TextBlur isBlurred length={ 6 }>
				-
			</TextBlur>
		);
	}

	if ( ! plan ) {
		return <SharedPlanCell { ...props } />;
	}

	return <span>{ plan.name }</span>;
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
