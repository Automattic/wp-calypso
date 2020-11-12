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
	price?: ReactNode;
	warningNote?: ReactNode;
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

export const TrailingContentSide: React.FunctionComponent< TrailingSideProps > = ( props ) => {
	if ( props.warningNote ) {
		return <div className="focused-launch-summary-item__warning-note">{ props.warningNote }</div>;
	}
	return <div className="focused-launch-summary-item__price-cost">{ props.price }</div>;
};

const FocusedLaunchSummaryItem: React.FunctionComponent<
	{
		isSelected?: boolean;
		readOnly?: boolean;
		children: [ ReturnType< typeof LeadingContentSide >, ReturnType< typeof TrailingContentSide > ];
	} & React.ButtonHTMLAttributes< HTMLButtonElement >
> = ( { children, isSelected = false, readOnly = false, ...rest } ) => {
	return (
		<button
			{ ...rest }
			disabled={ readOnly }
			className={ classnames( 'focused-launch-summary__item', {
				'is-selected': isSelected,
				'is-readonly': readOnly,
			} ) }
		>
			{ children[ 0 ] }
			{ children[ 1 ] }
		</button>
	);
};

export default FocusedLaunchSummaryItem;
