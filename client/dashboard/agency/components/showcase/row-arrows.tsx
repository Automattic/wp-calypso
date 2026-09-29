import { Button, __experimentalHStack as HStack } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { chevronLeft, chevronRight } from '@wordpress/icons';
import { useEffect, useRef, useState } from 'react';

/**
 * A row that scrolls sideways when it outgrows the page: whether it can go
 * back or forward, and a page step of 80% of its width.
 */
export function useRowScroll< T extends HTMLElement >() {
	const rowRef = useRef< T >( null );
	const [ canScroll, setCanScroll ] = useState( { back: false, forward: false } );

	useEffect( () => {
		const row = rowRef.current;
		if ( ! row ) {
			return;
		}
		const update = () => {
			const max = row.scrollWidth - row.clientWidth;
			setCanScroll( { back: row.scrollLeft > 1, forward: row.scrollLeft < max - 1 } );
		};
		update();
		row.addEventListener( 'scroll', update, { passive: true } );
		const observer = new ResizeObserver( update );
		observer.observe( row );
		return () => {
			row.removeEventListener( 'scroll', update );
			observer.disconnect();
		};
	}, [] );

	const page = ( direction: 1 | -1 ) => {
		const row = rowRef.current;
		row?.scrollBy( { left: direction * row.clientWidth * 0.8 } );
	};

	return { rowRef, canScroll, page };
}

/**
 * Previous and next for a scrolling row, for a section header's actions;
 * undefined while the row fits, so the header shows none.
 */
export function rowArrows( {
	canScroll,
	page,
}: Pick< ReturnType< typeof useRowScroll >, 'canScroll' | 'page' > ) {
	if ( ! canScroll.back && ! canScroll.forward ) {
		return undefined;
	}
	return (
		<HStack spacing={ 1 } expanded={ false }>
			<Button
				icon={ chevronLeft }
				label={ __( 'Previous' ) }
				size="compact"
				variant="tertiary"
				disabled={ ! canScroll.back }
				accessibleWhenDisabled
				onClick={ () => page( -1 ) }
			/>
			<Button
				icon={ chevronRight }
				label={ __( 'Next' ) }
				size="compact"
				variant="tertiary"
				disabled={ ! canScroll.forward }
				accessibleWhenDisabled
				onClick={ () => page( 1 ) }
			/>
		</HStack>
	);
}
