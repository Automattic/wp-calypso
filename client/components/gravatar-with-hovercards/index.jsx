import { Hovercards } from '@gravatar-com/hovercards/react';
import { useEffect } from 'react';
import Gravatar from '../gravatar';
import '@gravatar-com/hovercards/dist/style.css';

export default function GravatarWithHovercards( props ) {
	// Force close any open hovercards when the component unmounts.
	// This prevents the popovers from remaining present after page change when Gravatars are used in click navigation.
	useEffect( () => {
		return () => {
			// Find and remove any hovercard elements that might be lingering
			const hovercards = document.querySelectorAll( '.gravatar-hovercard' );
			hovercards.forEach( ( card ) => card.remove() );
		};
	}, [] );

	return (
		<Hovercards>
			<Gravatar { ...props } />
		</Hovercards>
	);
}
