/**
 * External dependencies
 */
import React, { useRef, useState, useCallback, useLayoutEffect } from 'react';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import Gridicon from 'calypso/components/gridicon';

/**
 * Style dependencies
 */
import './style.scss';

interface FAQProps {
	id: string;
	question?: React.ReactNode;
	children?: React.ReactNode;
	className?: string;
	icon?: string;
	iconSize?: number;
	expanded?: boolean;
	onToggle?: ( callbackArgs: { id: string; isExpanded: boolean; height: number } ) => void;
}

const ICON_SIZE = 24;

const FoldableFAQ: React.FC< FAQProps > = ( {
	id,
	question,
	children,
	className = '',
	icon = 'chevron-right',
	iconSize = ICON_SIZE,
	expanded = false,
	onToggle,
} ) => {
	const firstRender = useRef< boolean >( true );
	const answerRef = useRef< HTMLDivElement | null >( null );

	const [ isExpanded, setIsExpanded ] = useState( expanded );
	const [ height, setHeight ] = useState( 0 );

	const toggleAnswer = useCallback( () => {
		setIsExpanded( ( isExpanded ) => ! isExpanded );
	}, [ setIsExpanded ] );

	useLayoutEffect( () => {
		const targetHeight = isExpanded ? answerRef?.current?.scrollHeight ?? 250 : 0;
		setHeight( targetHeight );

		// Run onToggle callback only when isExpanded changes, not on first render(mount).
		if ( firstRender.current ) {
			firstRender.current = false;
			return;
		}

		const callbackArgs = {
			id,
			isExpanded,
			height: targetHeight,
		};
		onToggle && onToggle( callbackArgs );
	}, [ id, isExpanded, onToggle ] );

	return (
		<div className={ classNames( 'foldable-faq', className, { 'is-expanded': isExpanded } ) }>
			<button
				className="foldable-faq__question"
				aria-controls={ id }
				aria-expanded={ isExpanded }
				onClick={ toggleAnswer }
			>
				<Gridicon icon={ icon } size={ iconSize } />
				<div className="foldable-faq__question-text">{ question }</div>
			</button>
			<div
				ref={ answerRef }
				style={ { maxHeight: `${ height }px` } }
				id={ id }
				className="foldable-faq__answer"
			>
				{ children }
			</div>
		</div>
	);
};

export default FoldableFAQ;
