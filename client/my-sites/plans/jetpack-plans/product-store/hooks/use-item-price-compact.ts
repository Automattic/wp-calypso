import { useEffect, useMemo, useRef, useState } from 'react';

const ITEM_PRICE_COMPACT_WIDTH_THRESHOLD = 270;

export const useItemPriceCompact = ( thresholdWidth = ITEM_PRICE_COMPACT_WIDTH_THRESHOLD ) => {
	const [ isCompact, setIsCompact ] = useState( false );
	const containerRef = useRef< HTMLDivElement >( null );

	useEffect( () => {
		const onResize = () => {
			if ( containerRef && containerRef.current ) {
				setIsCompact( containerRef.current.offsetWidth < thresholdWidth );
			}
		};

		onResize();
		window.addEventListener( 'resize', onResize );

		return () => window.removeEventListener( 'resize', onResize );
	}, [ containerRef, thresholdWidth ] );

	return useMemo(
		() => ( {
			isCompact,
			containerRef,
		} ),
		[ isCompact ]
	);
};
