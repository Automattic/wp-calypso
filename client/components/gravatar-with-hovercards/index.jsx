import config from '@automattic/calypso-config';
import { Hovercards } from '@gravatar-com/hovercards/react';
import { useEffect, useRef, useState } from 'react';
import Gravatar from '../gravatar';
import HovercardContentPortal from './hovercard-content';

import '@gravatar-com/hovercards/dist/style.css';

function GravatarWithHovercards( props ) {
	const containerRef = useRef( null );
	const [ mountNode, setMountNode ] = useState( null );
	// Depending on how/where the user info is built, the property name may be different.
	const login = props.user?.wpcom_login || props.user?.user_login || props.user?.username;

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
				// Create new clean Header section.
				const newHeader = document.createElement( 'div' );
				newHeader.className = 'gravatar-hovercard__header';

				// Query items to preserve.
				const avatarLink = inner.querySelector( '.gravatar-hovercard__avatar-link' );
				const nameElement = inner.querySelector( '.gravatar-hovercard__name' );
				const description = inner.querySelector( '.gravatar-hovercard__description' );

				// Update links to reader profile if login is available.
				if ( login ) {
					if ( avatarLink ) {
						avatarLink.href = `/reader/users/${ login }`;
						avatarLink.removeAttribute( 'target' );
					}

					if ( nameElement ) {
						const nameLink = document.createElement( 'a' );
						nameLink.href = `/reader/users/${ login }`;
						nameLink.className = 'gravatar-hovercard__name-link';
						nameLink.textContent = nameElement.textContent;
						nameElement.textContent = '';
						nameElement.appendChild( nameLink );
					}
				}

				// Add preserved items back to the header.
				avatarLink && newHeader.appendChild( avatarLink );
				nameElement && newHeader.appendChild( nameElement );
				description && newHeader.appendChild( description );

				// Clear inner and add only our new Header.
				inner.innerHTML = '';
				inner.appendChild( newHeader );

				// Components for the body and footer will enter through this via portal.
				setMountNode( inner );
			}
		}
	};

	const shouldShowHovercard = () => {
		// Only show the hovercard if the container is in the dom.
		return containerRef.current && document.body.contains( containerRef.current );
	};

	return (
		<div ref={ containerRef }>
			<HovercardContentPortal mountNode={ mountNode } { ...props } />
			<Hovercards
				onHovercardShown={ handleHovercardShown }
				onCanShowHovercard={ shouldShowHovercard }
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
