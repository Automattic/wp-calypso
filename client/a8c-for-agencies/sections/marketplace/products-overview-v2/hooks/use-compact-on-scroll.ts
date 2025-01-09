import { useCallback, useState } from 'react';

export default function useCompactOnScroll() {
	const [ isCompact, setIsCompact ] = useState( false );
	const [ lastScrollPosition, setLastScrollPosition ] = useState( 0 );

	const onScroll = useCallback(
		( event: React.UIEvent< HTMLDivElement > ) => {
			const scrollPosition = event.currentTarget.scrollTop;
			const isScrollingDown = scrollPosition > lastScrollPosition;

			if ( isScrollingDown && ! isCompact && scrollPosition > 200 ) {
				setIsCompact( true );
			} else if ( ! isScrollingDown && isCompact && scrollPosition === 0 ) {
				setIsCompact( false );
			}

			setLastScrollPosition( scrollPosition );
		},
		[ isCompact, lastScrollPosition ]
	);

	return {
		onScroll,
		isCompact,
	};
}
