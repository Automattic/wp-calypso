import { debounce } from 'lodash';
import { useState, useEffect } from 'react';

const DEBOUNCE_TIME = 300;

function getWindowDimensions() {
	const { innerWidth: width, innerHeight: height } = window;
	return {
		width,
		height,
	};
}

export default function useWindowDimensions() {
	const [ windowDimensions, setWindowDimensions ] = useState( getWindowDimensions() );

	useEffect( () => {
		function handleResize() {
			setWindowDimensions( getWindowDimensions() );
		}

		const throttledHandleResize = debounce( handleResize, DEBOUNCE_TIME );

		window.addEventListener( 'resize', throttledHandleResize );
		return () => window.removeEventListener( 'resize', throttledHandleResize );
	}, [] );

	return windowDimensions;
}
