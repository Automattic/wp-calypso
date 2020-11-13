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
	question?: React.ReactNode;
	children?: React.ReactNode;
	className?: string;
	icon?: string;
	iconSize?: number;
	expanded?: boolean;
}

const ICON_SIZE = 24;

const FoldableFAQ: React.FC< FAQProps > = ( {
	question,
	children,
	className = 'foldable-faq',
	icon = 'chevron-right',
	iconSize = ICON_SIZE,
	expanded = false,
} ) => {
	const answerRef = useRef< HTMLDivElement | null >( null );

	const [ isExpanded, setIsExpanded ] = useState( expanded );
	const [ height, setHeight ] = useState( 0 );

	const toggleAnswer = useCallback( () => {
		setIsExpanded( ( isExpanded ) => ! isExpanded );
	}, [ setIsExpanded ] );

	useLayoutEffect( () => {
		if ( isExpanded ) {
			setHeight( answerRef?.current?.scrollHeight || 250 );
		} else {
			setHeight( 0 );
		}
	}, [ isExpanded ] );

	return (
		<div className={ classNames( 'foldable-faq', className, { 'is-expanded': isExpanded } ) }>
			<div className="foldable-faq__question" onClick={ toggleAnswer }>
				<Gridicon icon={ icon } size={ iconSize } />
				<div className="foldable-faq__question-text">{ question }</div>
			</div>
			<div
				ref={ answerRef }
				style={ { maxHeight: `${ height }px` } }
				className="foldable-faq__answer"
			>
				{ children }
			</div>
		</div>
	);
};

export default FoldableFAQ;
