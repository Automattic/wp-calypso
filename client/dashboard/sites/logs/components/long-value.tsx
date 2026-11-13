import { Button } from '@wordpress/components';
import { useResizeObserver } from '@wordpress/compose';
import { __ } from '@wordpress/i18n';
import clsx from 'clsx';
import { useState } from 'react';

import './style.scss';

/**
 * A log value limited to two lines. When it does not fit, a button under it shows
 * the rest in place.
 */
export function LongValue( { value }: { value: string } ) {
	const [ isClamped, setIsClamped ] = useState( false );
	const [ isExpanded, setIsExpanded ] = useState( false );
	const textRef = useResizeObserver( ( [ entry ] ) => {
		// An expanded value has nothing left to measure, keep the last answer.
		if ( ! entry.target.classList.contains( 'is-expanded' ) ) {
			setIsClamped( entry.target.scrollHeight > entry.target.clientHeight + 1 );
		}
	} );

	return (
		<span className="site-logs-long-value">
			<span
				ref={ textRef }
				className={ clsx( 'site-logs-long-value__text', { 'is-expanded': isExpanded } ) }
			>
				{ value }
			</span>
			{ ( isClamped || isExpanded ) && (
				<Button
					className="site-logs-long-value__toggle"
					variant="link"
					aria-expanded={ isExpanded }
					onClick={ () => setIsExpanded( ! isExpanded ) }
				>
					{ isExpanded ? __( 'Show less' ) : __( 'Show more' ) }
				</Button>
			) }
		</span>
	);
}
