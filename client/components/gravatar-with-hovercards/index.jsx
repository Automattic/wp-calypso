import config from '@automattic/calypso-config';
import { Hovercards } from '@gravatar-com/hovercards/react';
import { useEffect, useRef, useState } from 'react';
import Gravatar from '../gravatar';
import HovercardContentPortal from './hovercard-content';

import '@gravatar-com/hovercards/dist/style.css';

function GravatarWithHovercards( props ) {
	const containerRef = useRef( null );
	const [ mountNode, setMountNode ] = useState( null );
	const [ gravatarData, setGravatarData ] = useState( {} );

	useEffect( () => {
		return () => {
			// Remove any lingering hovercards on unmount
			const hovercards = document.querySelectorAll( '.gravatar-hovercard' );
			hovercards.forEach( ( card ) => card.remove() );
		};
	}, [] );

	const handleHovercardShown = ( hash, hovercardElement ) => {
		// Customize the hovercard.
		if ( hovercardElement ) {
			const inner = hovercardElement.querySelector( '.gravatar-hovercard__inner' );
			if ( inner ) {
				inner.innerHTML = '';

				// Our custom components for the card will render through this portal.
				setMountNode( inner );
			}
		}
	};

	const shouldShowHovercard = () => {
		// Only show the hovercard if the container is in the dom.
		return containerRef.current && document.body.contains( containerRef.current );
	};

	const onFetchProfileSuccess = ( hash, data ) => {
		setGravatarData( data );
	};

	return (
		<div ref={ containerRef }>
			<HovercardContentPortal mountNode={ mountNode } gravatarData={ gravatarData } { ...props } />
			<Hovercards
				onHovercardShown={ handleHovercardShown }
				onCanShowHovercard={ shouldShowHovercard }
				onFetchProfileSuccess={ onFetchProfileSuccess }
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
