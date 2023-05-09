import { useEffect, useRef } from 'react';

interface Props {
	stickyOptions?: IntersectionObserverInit;
	onShouldStickyChange: ( value: boolean ) => void;
}

const StickyPositioner = ( { stickyOptions, onShouldStickyChange }: Props ) => {
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
			onShouldStickyChange( ! entry.isIntersecting );
		};

		observerRef.current = new IntersectionObserver( handler, stickyOptions );
		observerRef.current.observe( targetRef.current );

		return () => {
			observerRef.current?.disconnect?.();
			onShouldStickyChange( false );
		};
	}, [ stickyOptions ] );

	return <div ref={ targetRef } />;
};

export default StickyPositioner;
