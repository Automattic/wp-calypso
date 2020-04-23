/**
 * External dependencies
 */
import { useEffect, DependencyList } from 'react';

/**
 * The user can either leave the page by navigating within the react app, or with browser navigation
 * The onUnmount event will be triggered once in either case
 * https://angelos.dev/2019/05/custom-react-hook-to-prevent-window-unload/
 *
 * @param onUnmount The function to be called when the component is unmounted
 * @param deps The react dependencies to be passed in to useEffect
 **/
export const useOnUnmount = ( onUnmount: () => void, deps?: DependencyList ) => {
	const onUnload = () => {
		onUnmount();
	};
	useEffect( () => {
		// Handles browser navigation events
		window.addEventListener( 'beforeunload', onUnload );

		// The returned cleanup function is triggered on page navigation events within the react app
		return () => {
			onUnload();
			window.removeEventListener( 'beforeunload', onUnload );
		};
	}, deps );
};
