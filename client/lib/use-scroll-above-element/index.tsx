import { useRef, useEffect, useState } from 'react';

const useScrollBelowElement = () => {
	const targetRef = useRef< HTMLDivElement >( null );
	const referenceRef = useRef< HTMLDivElement >( null );
	const [ isAboveElement, setIsAboveElement ] = useState( false );

	useEffect( () => {
		if ( ! targetRef || ! referenceRef ) {
			return;
		}

		const handleScroll = () => {
			const headerHeight = referenceRef?.current?.getBoundingClientRect().height;
			const offset =
				targetRef.current && headerHeight ? targetRef.current.offsetTop - headerHeight : 0;
			const scrollPosition = window.scrollY;

			if ( offset > 0 && scrollPosition < offset ) {
				setIsAboveElement( false );
			} else {
				setIsAboveElement( true );
			}
		};

		handleScroll();

		window.addEventListener( 'scroll', handleScroll );
		return () => {
			window.removeEventListener( 'scroll', handleScroll );
		};
	}, [ targetRef ] );

	return {
		targetRef,
		referenceRef,
		isAboveElement,
	};
};

export default useScrollBelowElement;
