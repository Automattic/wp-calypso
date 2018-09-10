/** @format */

/**
 * External dependencies
 */

import React from 'react';
import GridiconCheckmark from 'gridicons/dist/checkmark';

/**
 * Internal dependencies
 */
import InfoPopover from 'components/info-popover';
import { isMobile } from 'lib/viewport';

export default function PlanFeaturesItem( { children, description, hideInfoPopover } ) {
	return (
		<div className="plan-features__item">
			<GridiconCheckmark className="plan-features__item-checkmark" size={ 18 } />
			{ children }
			{ hideInfoPopover ? null : (
				<InfoPopover
					className="plan-features__item-tip-info"
					position={ isMobile() ? 'left' : 'right' }
				>
					{ description }
				</InfoPopover>
			) }
		</div>
	);
}
