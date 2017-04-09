/**
 * External dependencies
 */
import React from 'react';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import InfoPopover from 'components/info-popover';
import viewport from 'lib/viewport';

export default function PlanFeaturesItem( {
	children,
	description,
	hideInfoPopover
} ) {
	return (
		<div className="plan-features__item">
			<Gridicon
				className="plan-features__item-checkmark"
				size={ 18 } icon="checkmark" />
			{ children }
			{ hideInfoPopover
				? null
				: <InfoPopover
					className="plan-features__item-tip-info"
					position={ viewport.isMobile() ? 'top' : 'right' }>
					{ description }
				</InfoPopover>
			}
		</div>
	);
}
