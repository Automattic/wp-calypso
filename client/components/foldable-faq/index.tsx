/**
 * External dependencies
 */
import React, { useRef, useState, useCallback, useLayoutEffect } from 'react';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import Gridicon from 'calypso/components/gridicon';
import useTrackCallback from 'calypso/lib/jetpack/use-track-callback';

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
} ) => {
	const answerRef = useRef< HTMLDivElement | null >( null );

	const [ isExpanded, setIsExpanded ] = useState( expanded );
	const [ height, setHeight ] = useState( 0 );

	const trackProps = { faq_id: id };
	const trackOpenFaq = useTrackCallback( undefined, 'calypso_plans_faq_open', trackProps );
	const trackCloseFaq = useTrackCallback( undefined, 'calypso_plans_faq_closed', trackProps );

	const toggleAnswer = useCallback( () => {
		setIsExpanded( ( isExpanded ) => ! isExpanded );
	}, [ setIsExpanded ] );

	useLayoutEffect( () => {
		if ( isExpanded ) {
			setHeight( answerRef?.current?.scrollHeight || 250 );
			trackOpenFaq();
		} else {
			setHeight( 0 );
			trackCloseFaq();
		}
	}, [ isExpanded, trackCloseFaq, trackOpenFaq ] );

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
