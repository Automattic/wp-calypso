import { useEffect, useRef } from 'react';

export default function useScrollToTop( exchange: boolean ) {
	const exchangePrev = useRef( exchange );

	useEffect( () => {
		// Scroll to top when exchange param changes
		// e.g. when user switches between domain and hosting results
		exchange !== exchangePrev.current && window?.scrollTo( 0, 0 );
		exchangePrev.current = exchange;
	}, [ exchange ] );
}
