import config from '@automattic/calypso-config';
import { useHovercards } from '@gravatar-com/hovercards/react';
import { useEffect, useRef, useState } from 'react';
import Gravatar from '../gravatar';
import HovercardContentPortal from './hovercard-content';

import '@gravatar-com/hovercards/dist/style.css';

function GravatarWithHovercards( props ) {
	const containerRef = useRef( null );
	const [ mountNode, setMountNode ] = useState( null );
	const [ gravatarData, setGravatarData ] = useState( {} );

	const hovercards = useHovercards( {
		onHovercardShown: ( hash, hovercardElement ) => {
			// Customize the hovercard.
			if ( hovercardElement ) {
				const inner = hovercardElement.querySelector( '.gravatar-hovercard__inner' );
				if ( inner ) {
					inner.innerHTML = '';

					// Our custom components for the card will render through this portal.
					setMountNode( inner );
				}
			}
		},
		onFetchProfileSuccess: ( hash, data ) => {
			setGravatarData( data );
		},
	} );

	useEffect( () => {
		// Attach hovercards to the container when it's available
		if ( containerRef.current ) {
			hovercards.attach( containerRef.current );
		}

		return () => {
			// Use the detach method to properly clean up hovercards on unmount
			hovercards.detach();
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [] ); // Empty array is correct here. We only want this to run on mount and unmount.

	return (
		<div ref={ containerRef }>
			<HovercardContentPortal mountNode={ mountNode } gravatarData={ gravatarData } { ...props } />
			<Gravatar { ...props } />
		</div>
	);
}

export default function GravatarWithHovercardsWrapper( props ) {
	if ( ! config.isEnabled( 'gravatar/hovercards' ) ) {
		return <Gravatar { ...props } />;
	}

	return <GravatarWithHovercards { ...props } />;
}
