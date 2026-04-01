import '@gravatar-com/hovercards/dist/style.css';
import { ProfileData } from '@gravatar-com/hovercards';
import { useHovercards } from '@gravatar-com/hovercards/dist/index.react';
import { useEffect, useRef, useState } from 'react';
import Gravatar from '../gravatar';
import HovercardContentPortal from './hovercard-content';

interface GravatarWithHovercardsProps {
	user: {
		ID?: number;
		wpcom_id?: number;
		primary_blog?: number;
		site_ID?: number;
		display_name?: string;
		name?: string;
		avatar_URL?: string;
	};
}

export default function GravatarWithHovercards( props: GravatarWithHovercardsProps ): JSX.Element {
	const containerRef = useRef< HTMLDivElement >( null );
	const [ mountNode, setMountNode ] = useState< Element | null >( null );
	const [ processedAvatarUrl, setProcessedAvatarUrl ] = useState< string | null >( null );
	const [ gravatarData, setGravatarData ] = useState< Partial< ProfileData > >( {} );

	const { attach, detach } = useHovercards( {
		onHovercardShown: ( hash: string, hovercardElement: HTMLDivElement ) => {
			if ( hovercardElement ) {
				const inner = hovercardElement.querySelector( '.gravatar-hovercard__inner' );
				if ( inner ) {
					// Get the processed avatar URL before clearing innerHTML
					const avatarImg: HTMLImageElement = inner.querySelector( '.gravatar-hovercard__avatar' )!;
					const extractedAvatarUrl = avatarImg ? avatarImg.src : null;

					inner.innerHTML = '';
					// Our custom components for the card will render through this portal.
					setMountNode( inner );

					setProcessedAvatarUrl( extractedAvatarUrl );
				}
			}
		},
		onFetchProfileSuccess: ( hash: string, data: Partial< ProfileData > ) => {
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
				processedAvatarUrl={ processedAvatarUrl }
				closeCard={ closeCard }
				{ ...props }
			/>
			<Gravatar { ...props } />
		</div>
	);
}
