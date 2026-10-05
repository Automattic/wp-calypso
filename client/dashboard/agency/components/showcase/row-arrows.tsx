import { Button, __experimentalHStack as HStack } from '@wordpress/components';
import { isRTL } from '@wordpress/i18n';
import { chevronLeft, chevronRight } from '@wordpress/icons';
import { useEffect, useRef, useState } from 'react';

export function useRowScroll< T extends HTMLElement >() {
	const rowRef = useRef< T >( null );
	const [ canScroll, setCanScroll ] = useState( { back: false, forward: false } );
	// Whether the row ends inside the window, rather than running to its edge.
	const [ isInset, setIsInset ] = useState( false );

	useEffect( () => {
		const row = rowRef.current;
		if ( ! row ) {
			return;
		}
		const update = () => {
			const rtl = getComputedStyle( row ).direction === 'rtl';
			const max = row.scrollWidth - row.clientWidth;
			// In RTL, scrollLeft runs from 0 down to -max.
			const offset = Math.abs( row.scrollLeft );
			const back = offset > 1;
			const forward = offset < max - 1;
			setCanScroll( ( prev ) =>
				prev.back === back && prev.forward === forward ? prev : { back, forward }
			);
			// The page is centred, so when its end stops short of the window, its
			// start stops short of the sidebar too.
			const rect = row.getBoundingClientRect();
			setIsInset( rtl ? rect.left > 1 : rect.right < document.documentElement.clientWidth - 1 );
		};
		update();
		row.addEventListener( 'scroll', update, { passive: true } );
		// A capped page keeps its width as the window grows, so watch the window too.
		window.addEventListener( 'resize', update );
		const observer = new ResizeObserver( update );
		observer.observe( row );
		return () => {
			row.removeEventListener( 'scroll', update );
			window.removeEventListener( 'resize', update );
			observer.disconnect();
		};
	}, [] );

	const page = ( direction: 1 | -1 ) => {
		const row = rowRef.current;
		if ( ! row ) {
			return;
		}
		const sign = getComputedStyle( row ).direction === 'rtl' ? -1 : 1;
		row.scrollBy( { left: sign * direction * row.clientWidth * 0.8 } );
	};

	return { rowRef, canScroll, isInset, page };
}

export interface RowArrowLabels {
	previous: string;
	next: string;
}

// Undefined while the row fits, so the header shows no arrows.
export function rowArrows( {
	canScroll,
	page,
	labels,
}: Pick< ReturnType< typeof useRowScroll >, 'canScroll' | 'page' > & {
	labels: RowArrowLabels;
} ) {
	if ( ! canScroll.back && ! canScroll.forward ) {
		return undefined;
	}
	return (
		<HStack spacing={ 1 } expanded={ false }>
			<Button
				icon={ isRTL() ? chevronRight : chevronLeft }
				label={ labels.previous }
				size="compact"
				variant="tertiary"
				disabled={ ! canScroll.back }
				accessibleWhenDisabled
				onClick={ () => page( -1 ) }
			/>
			<Button
				icon={ isRTL() ? chevronLeft : chevronRight }
				label={ labels.next }
				size="compact"
				variant="tertiary"
				disabled={ ! canScroll.forward }
				accessibleWhenDisabled
				onClick={ () => page( 1 ) }
			/>
		</HStack>
	);
}
