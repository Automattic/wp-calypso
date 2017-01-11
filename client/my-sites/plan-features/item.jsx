/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import Gridicon from 'components/gridicon';
import InfoPopover from 'components/info-popover';
import viewport from 'lib/viewport';

export default function PlanFeaturesItem( {
	children,
	description
} ) {
	return (
		<div className="plan-features__item">
			<Gridicon
				className="plan-features__item-checkmark"
				size={ 18 } icon="checkmark" />
			{ children }
			<InfoPopover
				className="plan-features__item-tip-info"
				position={ viewport.isMobile() ? 'top' : 'right' }>
				{ description }
			</InfoPopover>
		</div>
	);
}
