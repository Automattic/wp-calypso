/* eslint-disable jsdoc/require-param */
import { useState, useEffect } from '@wordpress/element';
import React from 'react';
import { usePopper } from 'react-popper';
import type { PopperModifier } from '../';

type PopperProps = Partial< Pick< ReturnType< typeof usePopper >, 'styles' | 'attributes' > >;

const usePopperHandler = (
	referenceElementSelector: string | null,
	popperElementRef: React.MutableRefObject< null | HTMLElement >,
	modifiers: PopperModifier[]
): PopperProps => {
	const referenceElement = referenceElementSelector
		? document.querySelector( referenceElementSelector )
		: null;

	const [ popperElement, setPopperElement ] = useState< HTMLElement | null >( null );

	const { styles, attributes } = usePopper( referenceElement, popperElement, {
		strategy: 'fixed',
		modifiers,
	} );

	useEffect( () => {
		setPopperElement( popperElementRef?.current );
	}, [ popperElementRef ] );

	return referenceElement ? { styles, attributes } : {};
};

export default usePopperHandler;
