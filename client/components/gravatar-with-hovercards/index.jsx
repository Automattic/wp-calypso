import { Hovercards } from '@gravatar-com/hovercards/react';
import { useEffect, useRef } from 'react';
import Gravatar from '../gravatar';
import '@gravatar-com/hovercards/dist/style.css';

// Create a single style element to control hovercard visibility. We do this because hovercards do
// not clean up their child popovers when the component unmounts. While the useEffect unmount
// cleanup works for removing existing hovercard popovers on unmount, there are cirumstances where
// hovercards will not appear until after this runs causing them to appear on the next page. An
// example of this is mousing over and clicking a Gravatar quickly, triggering navigation before the
// hovercard has initially appeared. In this circumstance the hovercard then appears after
// navigation and the cleanup attempt. Other methods, such as checking a container ref
// onHovercardShown to see if we need to remove the outdated popover, do remove the popovers but
// have a jarring flickering effect as the hovercard is still initially visible before removal.
// Controlling visiblity this way prevents the flickering in cleanup: we ensure hovercards have no
// visibility until verifying that their container ref is in the dom.
let styleElement = document.getElementById( 'gravatar-hovercard-style' );
if ( ! styleElement ) {
	styleElement = document.createElement( 'style' );
	styleElement.id = 'gravatar-hovercard-style';
	styleElement.textContent = '.gravatar-hovercard { display: none !important; }';
	document.head.appendChild( styleElement );
}

const hideHovercards = () => {
	if ( ! document.head.contains( styleElement ) ) {
		document.head.appendChild( styleElement );
	}
};

const showHovercards = () => {
	styleElement.remove();
};

export default function GravatarWithHovercards( props ) {
	const containerRef = useRef( null );
	// Force close any open hovercards when the component unmounts.
	// This prevents the popovers from remaining present after page change when Gravatars are used in click navigation.
	useEffect( () => {
		return () => {
			// Remove any lingering hovercards on unmount.
			const hovercards = document.querySelectorAll( '.gravatar-hovercard' );
			hovercards.forEach( ( card ) => card.remove() );
			// Ensure hovercards will remain hidden until container ref is verified onHovercardShown.
			hideHovercards();
		};
	}, [] );

	const handleHovercardShown = ( hash, hovercardElement ) => {
		// Only show the hovercard if our container is in the dom.
		if ( containerRef.current && document.body.contains( containerRef.current ) ) {
			showHovercards();
		} else {
			hovercardElement?.remove();
			hideHovercards();
		}
	};

	return (
		<div ref={ containerRef }>
			<Hovercards onHovercardShown={ handleHovercardShown } onHovercardHidden={ hideHovercards }>
				<Gravatar { ...props } />
			</Hovercards>
		</div>
	);
}
