import { Gridicon } from '@automattic/components';
import classNames from 'classnames';
import { useRef, useState, useCallback, useEffect, useLayoutEffect } from 'react';
import type { FC, ReactNode } from 'react';

import './style.scss';

interface FAQProps {
	id: string;
	question?: ReactNode;
	children?: ReactNode;
	className?: string;
	icon?: string;
	iconSize?: number;
	expanded?: boolean;
	onToggle?: ( callbackArgs: {
		id: string;
		buttonId: string;
		isExpanded: boolean;
		height: number;
	} ) => void;
}

const ICON_SIZE = 24;

const FoldableFAQ: FC< FAQProps > = ( {
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
	const buttonRef = useRef< HTMLButtonElement >( null );
	const answerRef = useRef< HTMLDivElement | null >( null );

	const [ isExpanded, setIsExpanded ] = useState( expanded );
	const [ height, setHeight ] = useState( 0 );

	const buttonId = `${ id }-faq`;

	const checkHash = useCallback( () => {
		return location.hash === `#${ buttonId }`;
	}, [ buttonId ] );

	const toggleAnswer = useCallback( () => {
		setIsExpanded( ( isExpanded ) => ! isExpanded );
	}, [ setIsExpanded ] );

	useEffect( () => {
		// Expand FAQ if hash is equal to buttonId
		const expandFaq = () => {
			if ( checkHash() ) {
				setIsExpanded( true );
			}
		};

		window.addEventListener( 'hashchange', expandFaq );

		return () => {
			window.removeEventListener( 'hashchange', expandFaq );
		};
	}, [ buttonId, checkHash ] );

	useLayoutEffect( () => {
		const targetHeight = isExpanded ? answerRef?.current?.scrollHeight ?? 250 : 0;
		setHeight( targetHeight );

		if ( firstRender.current ) {
			// Scroll to anchor tag and expand FAQ if hash is equal to buttonId on first render
			if ( checkHash() ) {
				setIsExpanded( true );
				buttonRef.current?.scrollIntoView();
			}
			// Run onToggle callback only when isExpanded changes, not on first render(mount).
			firstRender.current = false;
			return;
		}

		const callbackArgs = {
			id,
			buttonId,
			isExpanded,
			height: targetHeight,
		};
		onToggle && onToggle( callbackArgs );
	}, [ id, buttonId, isExpanded, onToggle, checkHash ] );

	return (
		<div className={ classNames( 'foldable-faq', className, { 'is-expanded': isExpanded } ) }>
			<button
				id={ buttonId }
				className="foldable-faq__question"
				ref={ buttonRef }
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
