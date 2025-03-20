import { useEffect, useRef, ReactNode } from 'react';

import './style.scss';

type Props = {
	siteId?: number;
	featureId: string;
	children?: ReactNode;
	className?: string;
};

export default function ItemViewContent( { siteId, featureId, children }: Props ) {
	const ref = useRef< HTMLDivElement >( null );

	useEffect( () => {
		window.setTimeout( () => {
			if ( ref.current ) {
				ref.current.scrollTop = 0;
			}
		}, 0 );
	}, [ siteId, featureId ] );

	return (
		<div className="hosting-dashboard-item-view__content" ref={ ref }>
			{ children }
		</div>
	);
}
