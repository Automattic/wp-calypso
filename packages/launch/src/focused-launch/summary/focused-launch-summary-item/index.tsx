/**
 * External dependencies
 */
import React, { ReactNode } from 'react';
import classnames from 'classnames';
import './style.scss';

interface LeadingSideProps {
	label: ReactNode;
	badgeText?: ReactNode;
}

interface TrailingSideProps {
	nodeType: 'PRICE' | 'WARNING';
}

export const LeadingContentSide: React.FunctionComponent< LeadingSideProps > = ( {
	label,
	badgeText,
} ) => {
	return (
		<div className="focused-launch-summary-item__leading-side">
			<span className="focused-launch-summary-item__leading-side-label">{ label }</span>
			{ badgeText ? (
				<span className="focused-launch-summary-item__leading-side-badge">{ badgeText }</span>
			) : null }
		</div>
	);
};

export const TrailingContentSide: React.FunctionComponent< TrailingSideProps > = ( {
	nodeType,
	children,
} ) => {
	return (
		<div
			className={ classnames( {
				'focused-launch-summary-item__warning-note': nodeType === 'WARNING',
				'focused-launch-summary-item__price-cost': nodeType === 'PRICE',
			} ) }
		>
			{ children }
		</div>
	);
};

const FocusedLaunchSummaryItem: React.FunctionComponent<
	{
		isSelected?: boolean;
		readOnly?: boolean;
		isLoading?: boolean;
		children: [ ReturnType< typeof LeadingContentSide >, ReturnType< typeof TrailingContentSide > ];
	} & React.ButtonHTMLAttributes< HTMLButtonElement >
> = ( { children, isSelected = false, readOnly = false, isLoading, ...rest } ) => {
	return (
		<button
			{ ...rest }
			disabled={ readOnly }
			className={ classnames( 'focused-launch-summary__item', {
				'is-selected': isSelected,
				'is-readonly': readOnly,
				'is-loading': isLoading,
			} ) }
		>
			{ children[ 0 ] }
			{ children[ 1 ] }
		</button>
	);
};

export default FocusedLaunchSummaryItem;
