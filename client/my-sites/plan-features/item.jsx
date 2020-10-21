/**
 * External dependencies
 */
import { useMobileBreakpoint } from '@automattic/viewport-react';
import React from 'react';
import Gridicon from 'calypso/components/gridicon';

/**
 * Internal dependencies
 */
import InfoPopover from 'calypso/components/info-popover';

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
