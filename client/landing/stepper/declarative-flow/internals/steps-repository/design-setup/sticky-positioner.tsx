import { useState, useEffect, useRef } from 'react';

interface Props {
	stickyOptions?: IntersectionObserverInit;
	onShouldStickyChange: ( value: boolean ) => void;
}

const StickyPositioner = ( { stickyOptions, onShouldStickyChange }: Props ) => {
	const [ shouldSticky, setShouldSticky ] = useState( false );
	const targetRef = useRef< HTMLDivElement >( null );
	const observerRef = useRef< IntersectionObserver >();

	useEffect( () => {
		if ( ! targetRef.current || observerRef.current ) {
			return;
		}

		const handler = ( entries: IntersectionObserverEntry[] ) => {
			if ( ! entries.length ) {
				return;
			}

			const [ entry ] = entries;
			setShouldSticky( ! entry.isIntersecting );
		};

		observerRef.current = new IntersectionObserver( handler, stickyOptions );
		observerRef.current.observe( targetRef.current );

		return () => observerRef.current?.disconnect?.();
	}, [ stickyOptions ] );

	useEffect( () => {
		onShouldStickyChange( shouldSticky );
	}, [ shouldSticky, onShouldStickyChange ] );

	return <div ref={ targetRef } />;
};

export default StickyPositioner;
