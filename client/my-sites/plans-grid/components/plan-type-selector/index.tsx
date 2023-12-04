import { useEffect } from '@wordpress/element';
import * as React from 'react';
import { CustomerTypeToggle } from './components/customer-type-toggle';
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

	if ( kind === 'customer' ) {
		return (
			<div className="plan-type-selector">
				<CustomerTypeToggle { ...props } />
			</div>
		);
	}

	return null;
};

export default PlanTypeSelector;
