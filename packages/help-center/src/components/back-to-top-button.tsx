import { Button } from '@automattic/components';
import { useEffect, useState, useCallback, useRef } from '@wordpress/element';
import { Icon, arrowUp } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import classnames from 'classnames';
import type { FC } from 'react';
import './back-to-top-button.scss';

const getScrollParent = ( el: HTMLElement | null ) => {
	let node = el;

	while ( node !== null ) {
		if ( node.scrollHeight > node.clientHeight ) {
			return node;
		}
		node = node.parentElement;
	}

	return null;
};

export const BackToTopButton: FC = () => {
	const elementRef = useRef( null );
	const scrollParentRef = useRef< HTMLElement | null >( null );
	const { __ } = useI18n();

	const SCROLL_THRESHOLD = 400;
	const [ visible, setVisible ] = useState( false );

	const scrollCallback = useCallback( () => {
		const containerNode = scrollParentRef.current;

		if ( containerNode ) {
			if ( containerNode.scrollTop > SCROLL_THRESHOLD ) {
				setVisible( true );
			} else {
				setVisible( false );
			}
		}
	}, [ scrollParentRef ] );

	useEffect( () => {
		if ( elementRef.current ) {
			scrollParentRef.current = getScrollParent( elementRef.current );
		}
	}, [ elementRef ] );

	useEffect( () => {
		const containerNode = scrollParentRef.current;

		if ( containerNode ) {
			containerNode.addEventListener( 'scroll', scrollCallback );

			return () => {
				containerNode.removeEventListener( 'scroll', scrollCallback );
			};
		}
	}, [ scrollParentRef, scrollCallback ] );

	const scrollToTop = () => {
		if ( scrollParentRef.current ) {
			scrollParentRef.current.scrollTop = 0;
		}
	};

	return (
		<Button
			ref={ elementRef }
			className={ classnames( 'back-to-top-button__help-center', { 'is-visible': visible } ) }
			onClick={ scrollToTop }
		>
			<Icon icon={ arrowUp } size={ 16 } />
			{ __( 'Back to top', __i18n_text_domain__ ) }
		</Button>
	);
};
