import { useScrollToTop } from '@automattic/components';
import { Button } from '@wordpress/components';
import { useCallback, useEffect, useRef } from '@wordpress/element';
import { Icon, arrowUp } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import clsx from 'clsx';
import type { FC } from 'react';
import './back-to-top-button.scss';

export const BackToTopButton: FC = () => {
	const elementRef = useRef< HTMLElement | null >( null );
	const scrollParentRef = useRef< HTMLElement | null >( null );
	const { __ } = useI18n();

	useEffect( () => {
		if ( elementRef.current ) {
			scrollParentRef.current = elementRef.current?.closest( '.help-center__container-content' );
		}
	}, [ elementRef ] );

	const isBelowThreshold = useCallback( ( containerNode: HTMLElement ) => {
		const SCROLL_THRESHOLD = 400;

		return containerNode.scrollTop > SCROLL_THRESHOLD;
	}, [] );

	const { isButtonVisible, scrollToTop } = useScrollToTop( {
		scrollTargetRef: scrollParentRef,
		isBelowThreshold,
		smoothScrolling: false,
	} );

	return (
		<Button
			ref={ elementRef }
			className={ clsx( 'back-to-top-button__help-center', {
				'is-visible': isButtonVisible,
			} ) }
			onClick={ scrollToTop }
		>
			<Icon icon={ arrowUp } size={ 16 } />
			{ __( 'Back to top', __i18n_text_domain__ ) }
		</Button>
	);
};
