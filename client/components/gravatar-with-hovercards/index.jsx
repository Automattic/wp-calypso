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

	const { attach, detach } = useHovercards( {
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
			attach( containerRef.current );
		}

		return () => {
			// Use the detach method to properly clean up hovercards on unmount
			detach();
		};
	}, [ attach, detach ] );

	const closeCard = () => {
		detach();
		if ( containerRef.current ) {
			attach( containerRef.current );
		}
	};

	return (
		<div ref={ containerRef }>
			<HovercardContentPortal
				mountNode={ mountNode }
				gravatarData={ gravatarData }
				closeCard={ closeCard }
				{ ...props }
			/>
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
