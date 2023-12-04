import { useEffect } from '@wordpress/element';
import * as React from 'react';
import { IntervalTypeToggle } from './components/interval-type-toggle';
import { PlanTypeSelectorProps } from './types';

import './style.scss';

const PlanTypeSelector: React.FunctionComponent< PlanTypeSelectorProps > = ( {
	kind,
	...props
} ) => {
	useEffect( () => {
		props.recordTracksEvent?.( 'calypso_plans_plan_type_selector_view', {
			kind,
		} );
	}, [] );

	if ( kind === 'interval' ) {
		return (
			<div className="plan-type-selector">
				<IntervalTypeToggle { ...props } />
			</div>
		);
	}
	/**
	 * Allowance for other types of toggles that maybe based on other plan attributes such as customer types
	 * Eg: Customer type toggle https://github.com/Automattic/wp-calypso/pull/27125
	 * Potential for a cleanup if such a dynamic is not required and plan type selector will always be based on time intervals, i.e. YAGNI.
	 */

	return null;
};

export default PlanTypeSelector;
export type { PlanTypeSelectorProps };
