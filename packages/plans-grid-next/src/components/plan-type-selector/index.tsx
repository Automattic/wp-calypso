import { useEffect } from '@wordpress/element';
import clsx from 'clsx';
import * as React from 'react';
import { StickyContainer } from '../sticky-container';
import { IntervalTypeSelector } from './components/interval-type-selector';
import type { PlanTypeSelectorProps } from '../../types';

import './style.scss';

const PlanTypeSelector: React.FunctionComponent< PlanTypeSelectorProps > = ( {
	kind,
	enableStickyBehavior = false,
	layoutClassName,
	stickyPlanTypeSelectorOffset = 0,
	...props
} ) => {
	useEffect( () => {
		props.recordTracksEvent?.( 'calypso_plans_plan_type_selector_view', {
			kind,
		} );
	}, [] );

	if ( kind === 'interval' ) {
		return (
			<StickyContainer
				stickyClass="is-sticky-plan-type-selector"
				disabled={ ! enableStickyBehavior }
				stickyOffset={ stickyPlanTypeSelectorOffset }
				zIndex={ 2 }
			>
				{ () => (
					<div className={ clsx( layoutClassName ) }>
						<div className="plan-type-selector">
							<IntervalTypeSelector { ...props } />
						</div>
					</div>
				) }
			</StickyContainer>
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
