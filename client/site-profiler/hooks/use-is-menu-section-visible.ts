import { useEffect, useState } from 'react';
import { calculateMetricsSectionScrollOffset } from '../utils/calculate-metrics-section-scroll-offset';

export function useIsMenuSectionVisible( ref: React.RefObject< HTMLObjectElement > | undefined ) {
	const [ isIntersecting, setIntersecting ] = useState( false );

	useEffect( () => {
		const observer = new IntersectionObserver(
			( [ entry ] ) => {
				setIntersecting( entry.isIntersecting );
			},
			{ rootMargin: `-${ calculateMetricsSectionScrollOffset() + 1 }px` } // the additional pixel triggers the tab change
		);

		ref?.current && observer.observe( ref.current );

		return () => {
			observer.disconnect();
		};
	}, [ ref ] );

	return isIntersecting;
}
