import { useEffect, useRef, ReactNode } from 'react';

import './style.scss';

type Props = {
	children?: ReactNode;
	className?: string;
};

export default function ItemViewContent( { children }: Props ) {
	const ref = useRef< HTMLDivElement >( null );

	useEffect( () => {
		window.setTimeout( () => {
			if ( ref.current ) {
				ref.current.scrollTop = 0;
			}
		}, 0 );
	}, [ children ] );

	return (
		<div className="multi-sites-dashboard-item-view__content" ref={ ref }>
			{ children }
		</div>
	);
}
