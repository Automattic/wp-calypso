import { useEffect, useRef } from 'react';

export const customPropertyForSubmitButtonHeight = '--submit-button-height';

function resizeStepAreaForFixedFooter( submitWrapper: HTMLDivElement | null ) {
	if ( ! submitWrapper ) {
		return;
	}
	const root = document.documentElement;
	if ( ! root.style ) {
		return;
	}
	const footerHeight = submitWrapper.clientHeight;
	root.style.setProperty( customPropertyForSubmitButtonHeight, `${ footerHeight }px` );
}

export function useResizeStepAreaForFixedFooter() {
	const submitWrapperRef = useRef< HTMLDivElement >( null );

	useEffect( () => {
		resizeStepAreaForFixedFooter( submitWrapperRef.current );
	}, [] );

	useEffect( () => {
		const onResize = () => resizeStepAreaForFixedFooter( submitWrapperRef.current );
		window.addEventListener( 'resize', onResize );
		return () => {
			window.removeEventListener( 'resize', onResize );
		};
	}, [] );

	return submitWrapperRef;
}
