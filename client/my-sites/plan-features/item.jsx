/** @format */

/**
 * External dependencies
 */

import React from 'react';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import InfoPopover from 'components/info-popover';
import { isMobile } from 'lib/viewport';

export default function PlanFeaturesItem( { children, description, hideInfoPopover } ) {
	return (
		<div className="plan-features__item">
			<Gridicon className="plan-features__item-checkmark" size={ 18 } icon="checkmark" />
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
