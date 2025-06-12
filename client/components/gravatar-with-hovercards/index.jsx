import config from '@automattic/calypso-config';
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
const createStyleElement = () => {
	let styleElement = document.getElementById( 'gravatar-hovercard-style' );
	if ( ! styleElement ) {
		styleElement = document.createElement( 'style' );
		styleElement.id = 'gravatar-hovercard-style';
		styleElement.textContent = '.gravatar-hovercard { display: none !important; }';
		document.head.appendChild( styleElement );
	}
	return styleElement;
};

const hideHovercards = ( styleElement ) => {
	if ( ! document.head.contains( styleElement ) ) {
		document.head.appendChild( styleElement );
	}
};

const showHovercards = ( styleElement ) => {
	styleElement.remove();
};

function GravatarWithHovercards( props ) {
	const containerRef = useRef( null );
	const styleElementRef = useRef( null );

	useEffect( () => {
		// Initialize style element only when component mounts
		styleElementRef.current = createStyleElement();
		return () => {
			// Remove any lingering hovercards on unmount
			const hovercards = document.querySelectorAll( '.gravatar-hovercard' );
			hovercards.forEach( ( card ) => card.remove() );
			// Ensure hovercards will remain hidden until container ref is verified for next hovercard
			if ( styleElementRef.current ) {
				hideHovercards( styleElementRef.current );
			}
		};
	}, [] );

	const handleHovercardShown = ( hash, hovercardElement ) => {
		// Only show the hovercard if our container is in the dom
		if ( containerRef.current && document.body.contains( containerRef.current ) ) {
			showHovercards( styleElementRef.current );
		} else {
			hovercardElement?.remove();
			hideHovercards( styleElementRef.current );
		}
	};

	return (
		<div ref={ containerRef }>
			<Hovercards
				onHovercardShown={ handleHovercardShown }
				onHovercardHidden={ () => hideHovercards( styleElementRef.current ) }
			>
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
