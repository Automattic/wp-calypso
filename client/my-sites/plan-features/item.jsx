/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import Gridicon from 'components/gridicon';
import InfoPopover from 'components/info-popover';

export default function PlanFeaturesItem( { description, children } ) {
	const renderTipinfo = () => {
		if ( ! description ) {
			return null;
		}

		return (
			<div className="plan-features__item-tip-info">
				<InfoPopover
					position="right"
				>
					{ description }
				</InfoPopover>
			</div>
		);
	};

	return (
		<li className="plan-features__item">
			<Gridicon className="plan-features__item-checkmark" size={ 18 } icon="checkmark" />
			{ children }
			{ renderTipinfo() }
		</li>
	);
}
