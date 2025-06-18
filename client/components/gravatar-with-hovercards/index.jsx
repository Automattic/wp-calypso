import config from '@automattic/calypso-config';
import { Hovercards } from '@gravatar-com/hovercards/react';
import { useEffect, useRef } from 'react';
import Gravatar from '../gravatar';
import '@gravatar-com/hovercards/dist/style.css';

function GravatarWithHovercards( props ) {
	const containerRef = useRef( null );

	useEffect( () => {
		return () => {
			// Remove any lingering hovercards on unmount
			const hovercards = document.querySelectorAll( '.gravatar-hovercard' );
			hovercards.forEach( ( card ) => card.remove() );
		};
	}, [] );

	const shouldShowHovercard = () => {
		// Only show the hovercard if the container is in the dom.
		return containerRef.current && document.body.contains( containerRef.current );
	};

	return (
		<div ref={ containerRef }>
			<Hovercards onCanShowHovercard={ shouldShowHovercard }>
				<Gravatar { ...props } />
			</Hovercards>
		</div>
	);
}

export default function GravatarWithHovercardsWrapper( props ) {
	if ( ! config.isEnabled( 'gravatar/hovercards' ) ) {
		return <Gravatar { ...props } />;
	}

	return <GravatarWithHovercards { ...props } />;
}
