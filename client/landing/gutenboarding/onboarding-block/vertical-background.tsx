/**
 * External dependencies
 */
import React, { FunctionComponent, useState, useEffect } from 'react';
import { SwitchTransition, CSSTransition } from 'react-transition-group';
import { useSelect } from '@wordpress/data';
import classnames from 'classnames';

/**
 * Internal dependencies
 */
import { STORE_KEY } from '../stores/onboard';

/**
 * Calypso dependencies
 */
import defaultImageUrl from '../../../../static/images/verticals/default.jpg';

export interface VerticalBackgroundProps {
	onLoad?: () => void;
}

const VerticalBackground: FunctionComponent< VerticalBackgroundProps > = ( {
	onLoad = () => undefined,
} ) => {
	const { siteVertical } = useSelect( select => select( STORE_KEY ).getState() );
	const [ imageUrl, setImageUrl ] = useState< string | undefined >();

	// Prefetch the default image.
	useEffect( () => void ( new window.Image().src = defaultImageUrl ), [] );

	useEffect( () => {
		// Has the user selected a vertical yet?
		if ( siteVertical ) {
			const preloadImage = new window.Image();
			const failureHandler = () => {
				setImageUrl( defaultImageUrl );
				onLoad();
			};

			// If this is a user-supplied vertical, use the default background.
			if ( ! siteVertical.id ) {
				return failureHandler;
			}

			// We get an esmodule wrapping the url here
			const successHandler = ( { default: url }: { default: string } ) => {
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
				`../../../../static/images/verticals/${ siteVertical.id }.jpg`
			).then( successHandler, failureHandler );
			return () => {
				preloadImage.onload = null;
				preloadImage.onerror = null;
			};
		}
		setImageUrl( undefined );
	}, [ siteVertical, onLoad ] );

	return (
		<SwitchTransition mode="in-out">
			<CSSTransition
				key={ imageUrl || 'none' }
				timeout={ 750 }
				classNames="onboarding-block__background-fade"
			>
				<div
					className={ classnames( 'onboarding-block__background', { 'has-background': imageUrl } ) }
					style={ {
						backgroundImage: imageUrl ? `url( ${ imageUrl } ) ` : 'none',
					} }
				/>
			</CSSTransition>
		</SwitchTransition>
	);
};
export default VerticalBackground;
