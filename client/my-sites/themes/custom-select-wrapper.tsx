import { CustomSelectControl } from '@wordpress/components';
import { useState, useLayoutEffect } from 'react';
import type { ComponentProps } from 'react';

// Wrapper component to handle SSR for CustomSelectControl
// This is needed because CustomSelectControl is not SSR-compatible
export const CustomSelectWrapper = ( props: ComponentProps< typeof CustomSelectControl > ) => {
	const [ isMounted, setIsMounted ] = useState( false );

	useLayoutEffect( () => {
		setIsMounted( true );
	}, [] );

	if ( ! isMounted ) {
		return null;
	}

	return <CustomSelectControl { ...props } />;
};
