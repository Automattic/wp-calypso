/**
 * External dependencies
 */
import React from 'react';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import Gridicon from 'components/gridicon';
import InfoPopover from 'components/info-popover';

export default function PlanFeaturesItem( { description, children, className } ) {
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

	const classes = classNames( 'plan-features__item', className );

	return (
		<div className={ classes }>
			<Gridicon className="plan-features__item-checkmark" size={ 18 } icon="checkmark" />
			{ children }
			{ renderTipinfo() }
		</div>
	);
}
