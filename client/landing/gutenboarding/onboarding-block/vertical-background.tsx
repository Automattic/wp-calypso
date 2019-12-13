/**
 * External dependencies
 */
import React, { FunctionComponent, useState, useEffect } from 'react';
import { SwitchTransition, CSSTransition } from 'react-transition-group';

/**
 * Calypso dependencies
 */
import defaultImageUrl from '../../../../static/images/verticals/default.jpg';

export interface VerticalBackgroundProps {
	id?: string;
	onLoad: () => void;
}

const VerticalBackground: FunctionComponent< VerticalBackgroundProps > = ( { id, onLoad } ) => {
	const [ imageUrl, setImageUrl ] = useState< string | null >( null );

	// Prefetch the default image.
	useEffect( () => void ( new window.Image().src = defaultImageUrl ), [] );

	useEffect( () => {
		const preloadImage = new window.Image();
		const failureHandler = () => {
			setImageUrl( defaultImageUrl );
			onLoad();
		};
		// We get an esmodule wrapping the url here
		const successHandler = ( { default: url }: { default: string } ) => {
			preloadImage;
			preloadImage.onload = () => {
				setImageUrl( url );
				onLoad();
			};
			preloadImage.onerror = failureHandler;
			preloadImage.src = url;
		};
		import(
			/**
			 * Set eager mode because these are just image _paths_.
			 */
			/* webpackMode: "eager" */
			/* webpackInclude: /\.jpg$/ */
			`../../../../static/images/verticals/${ id }.jpg`
		).then( successHandler, failureHandler );
		return () => {
			preloadImage.onload = null;
			preloadImage.onerror = null;
		};
	}, [ id, onLoad ] );

	return (
		<SwitchTransition mode="in-out">
			<CSSTransition
				key={ imageUrl || 'empty' }
				timeout={ 1000 }
				classNames="onboarding-block__background-fade"
			>
				<div
					className="onboarding-block__background"
					style={ {
						backgroundImage: imageUrl ? `url(${ imageUrl })` : 'none',
					} }
				/>
			</CSSTransition>
		</SwitchTransition>
	);
};
export default VerticalBackground;
