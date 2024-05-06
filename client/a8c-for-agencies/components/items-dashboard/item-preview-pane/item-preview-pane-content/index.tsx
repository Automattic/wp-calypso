import { useEffect, useRef, ReactNode } from 'react';

import './style.scss';

type Props = {
	featureId: string;
	children?: ReactNode;
	className?: string;
};

export default function ItemPreviewPaneContent( { featureId, children }: Props ) {
	const ref = useRef< HTMLDivElement >( null );

	useEffect( () => {
		window.setTimeout( () => {
			if ( ref.current ) {
				ref.current.scrollTop = 0;
			}
		}, 0 );
	}, [ featureId ] );

	return (
		<div className="item-preview__content" ref={ ref }>
			{ children }
		</div>
	);
}
