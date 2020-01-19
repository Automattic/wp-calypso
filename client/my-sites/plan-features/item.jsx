/**
 * External dependencies
 */

import React from 'react';
import Gridicon from 'components/gridicon';

/**
 * Internal dependencies
 */
import InfoPopover from 'components/info-popover';
import { useMobileBreakpoint } from 'lib/viewport/react';

export default function PlanFeaturesItem( {
	children,
	description,
	hideInfoPopover,
	hideGridicon = false,
} ) {
	const isMobile = useMobileBreakpoint();

	return (
		<div className="plan-features__item">
			{ ! hideGridicon && (
				<Gridicon className="plan-features__item-checkmark" size={ 18 } icon="checkmark" />
			) }
			{ children }
			{ hideInfoPopover ? null : (
				<InfoPopover
					className="plan-features__item-tip-info"
					position={ isMobile ? 'left' : 'right' }
				>
					{ description }
				</InfoPopover>
			) }
		</div>
	);
}
