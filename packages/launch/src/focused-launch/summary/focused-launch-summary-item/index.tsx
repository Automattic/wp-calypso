/**
 * External dependencies
 */
import React, { ReactNode } from 'react';
import classnames from 'classnames';

import './style.scss';

const FocusedLaunchSummaryItem: React.FunctionComponent< {
	leftSide: ReactNode;
	rightSide: ReactNode;
	isSelected?: boolean;
} > = ( { leftSide, rightSide, isSelected = false } ) => {
	return (
		<div className={ classnames( 'focused-launch-summary__item', { 'is-selected': isSelected } ) }>
			<div className="focused-launch-summary-item__left-side">{ leftSide }</div>
			<div className="focused-launch-summary-item__right-side">{ rightSide }</div>
		</div>
	);
};

export default FocusedLaunchSummaryItem;
