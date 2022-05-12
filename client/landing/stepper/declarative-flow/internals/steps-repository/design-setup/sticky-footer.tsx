/* eslint-disable wpcalypso/jsx-classname-namespace */

import classnames from 'classnames';
import { useEffect, useRef, useState } from 'react';

interface StickyFooterProps {
	className: string;
	targetRef: React.RefObject< HTMLElement | null >;
	children: React.ReactNode;
}

const StickyFooter: React.FC< StickyFooterProps > = ( { className, targetRef, children } ) => {
	const [ isTargetInViewport, setIsTargetInViewport ] = useState( true );
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
			setIsTargetInViewport( entry.isIntersecting );
		};

		observerRef.current = new IntersectionObserver( handler );
		observerRef.current.observe( targetRef.current );

		return () => observerRef.current?.disconnect?.();
	}, [] );

	return (
		<div className={ classnames( className, { 'is-visible': ! isTargetInViewport } ) }>
			{ children }
		</div>
	);
};

export default StickyFooter;
