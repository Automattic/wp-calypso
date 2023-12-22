import { Card, CompactCard, ScreenReaderText, Gridicon } from '@automattic/components';
import classNames from 'classnames';
import React, { FC, useState, useEffect, useCallback, PropsWithChildren } from 'react';
import './style.scss';

type FoldableCardProps = {
	actionButton?: React.ReactNode;
	actionButtonExpanded?: React.ReactNode;
	cardKey?: string;
	clickableHeader?: boolean;
	compact?: boolean;
	disabled?: boolean;
	expandedSummary?: React.ReactNode;
	expanded?: boolean;
	headerTagName?: string;
	header?: string;
	icon?: string;
	iconSize?: number;
	onClick?: () => void;
	onClose?: ( key: string ) => void;
	onOpen?: ( key: string ) => void;
	screenReaderText?: string | boolean;
	summary?: React.ReactNode;
	hideSummary?: boolean;
	highlight?: string;
	smooth?: boolean;
	contentExpandedStyle?: React.CSSProperties;
	contentCollapsedStyle?: React.CSSProperties;
	className?: string;
} & PropsWithChildren;

const noop = () => {};

const FoldableCard: FC< FoldableCardProps > = ( {
	actionButton,
	actionButtonExpanded,
	cardKey = '',
	clickableHeader = false,
	compact = false,
	disabled = false,
	expandedSummary,
	expanded = false,
	headerTagName = 'span',
	icon = 'chevron-down',
	iconSize = 24,
	onClick = noop,
	onClose = noop,
	onOpen = noop,
	screenReaderText = false,
	summary,
	hideSummary = false,
	highlight,
	smooth = false,
	contentExpandedStyle,
	contentCollapsedStyle,
	className,
	children,
} ) => {
	const [ isExpanded, setIsExpanded ] = useState( expanded );

	useEffect( () => {
		setIsExpanded( expanded );
	}, [ expanded ] );

	const handleClick = useCallback( () => {
		if ( children ) {
			setIsExpanded( ! isExpanded );
		}

		onClick();

		if ( isExpanded ) {
			onClose( cardKey );
		} else {
			onOpen( cardKey );
		}
	}, [ isExpanded, onClick, onClose, onOpen, cardKey, children ] );

	const getClickAction = (): React.MouseEventHandler< HTMLElement > | undefined => {
		if ( disabled ) {
			return;
		}
		return handleClick;
	};

	const getActionButton = () => {
		return isExpanded ? actionButtonExpanded || actionButton : actionButton;
	};

	const renderActionButton = () => {
		const clickAction = ! clickableHeader ? getClickAction() : undefined;
		if ( actionButton ) {
			return (
				<div className="foldable-card__action" role="presentation" onClick={ clickAction }>
					{ getActionButton() }
				</div>
			);
		}
		if ( children ) {
			const screenReaderTextContent = screenReaderText || 'More';
			return (
				<button
					disabled={ disabled }
					type="button"
					className="foldable-card__action foldable-card__expand"
					aria-expanded={ isExpanded }
					onClick={ clickAction }
				>
					<ScreenReaderText>{ screenReaderTextContent }</ScreenReaderText>
					<Gridicon icon={ icon } size={ iconSize } />
				</button>
			);
		}
	};

	const renderContent = () => {
		const additionalStyle = isExpanded ? contentExpandedStyle : contentCollapsedStyle;
		return (
			<div className="foldable-card__content" style={ additionalStyle }>
				{ children }
			</div>
		);
	};

	const renderHeader = () => {
		const summaryElement = summary ? (
			<span className="foldable-card__summary">{ summary }</span>
		) : null;
		const expandedSummaryElement = expandedSummary ? (
			<span className="foldable-card__summary-expanded">{ expandedSummary }</span>
		) : null;
		const headerClickAction = clickableHeader ? getClickAction() : undefined;
		const headerClasses = classNames( 'foldable-card__header', {
			'is-clickable': clickableHeader,
			'has-border': summary,
		} );
		const header = React.createElement(
			headerTagName,
			{ className: 'foldable-card__main' },
			summaryElement,
			expandedSummaryElement,
			renderActionButton()
		);

		return (
			<div className={ headerClasses } role="presentation" onClick={ headerClickAction }>
				{ header }
				{ ! hideSummary && (
					<span className="foldable-card__secondary">
						{ summaryElement }
						{ expandedSummaryElement }
					</span>
				) }
			</div>
		);
	};

	const Container = compact ? CompactCard : Card;
	const itemSiteClasses = classNames( 'foldable-card', className, {
		'is-disabled': disabled,
		'is-expanded': isExpanded,
		'has-expanded-summary': !! expandedSummary,
		'is-smooth': smooth,
	} );

	return (
		<Container className={ itemSiteClasses } highlight={ highlight }>
			{ renderHeader() }
			{ ( isExpanded || smooth ) && renderContent() }
		</Container>
	);
};

export default FoldableCard;
