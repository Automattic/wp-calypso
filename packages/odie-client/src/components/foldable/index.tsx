import { Card, CompactCard, ScreenReaderText, Gridicon } from '@automattic/components';
import clsx from 'clsx';
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
	header = '',
	icon = 'chevron-down',
	iconSize = 24,
	onClick = noop,
	onClose = noop,
	onOpen = noop,
	screenReaderText = false,
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
				<div className="odie-foldable-card__action" role="presentation" onClick={ clickAction }>
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
					className="odie-foldable-card__action odie-foldable-card__expand"
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
			<div className="odie-foldable-card__content" style={ additionalStyle }>
				{ children }
			</div>
		);
	};

	const Container = compact ? CompactCard : Card;
	const itemSiteClasses = clsx( 'odie-foldable-card', className, {
		'is-disabled': disabled,
		'is-expanded': isExpanded,
		'has-expanded-summary': !! expandedSummary,
		'is-smooth': smooth,
	} );

	return (
		<Container className={ itemSiteClasses } highlight={ highlight }>
			<div
				className="odie-foldable-card__header is-clickable"
				role="presentation"
				onClick={ getClickAction() }
			>
				<span className="odie-foldable-card__main">{ header }</span>
				{ renderActionButton() }
			</div>
			{ ( isExpanded || smooth ) && renderContent() }
		</Container>
	);
};

export default FoldableCard;
