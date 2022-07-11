import { Button } from '@automattic/components';
import { useCallback, useEffect, useState } from '@wordpress/element';
import { Icon, arrowUp } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import classnames from 'classnames';
import type { FC, RefObject } from 'react';
import './back-to-top-button.scss';

type Props = { container: RefObject< HTMLDivElement > };

export const BackToTopButton: FC< Props > = ( { container } ) => {
	const { __ } = useI18n();
	const [ visible, setVisible ] = useState( false );

	const SCROLL_THRESHOLD = 400;

	const scrollCallback = useCallback( () => {
		const containerNode = container.current;

		if ( containerNode ) {
			if ( containerNode.scrollTop > SCROLL_THRESHOLD ) {
				setVisible( true );
			} else {
				setVisible( false );
			}
		}
	}, [ container ] );

	useEffect( () => {
		const containerNode = container?.current;

		if ( containerNode ) {
			containerNode.addEventListener( 'scroll', scrollCallback );

			return () => {
				containerNode.removeEventListener( 'scroll', scrollCallback );
			};
		}
	}, [ container, scrollCallback ] );

	const goToTop = () => {
		if ( container.current ) {
			container.current.scrollTop = 0;
		}
	};

	return (
		<Button
			className={ classnames( 'back-to-top-button__help-center', { 'is-visible': visible } ) }
			onClick={ goToTop }
		>
			<Icon icon={ arrowUp } size={ 16 } />
			{ __( 'Back to top', __i18n_text_domain__ ) }
		</Button>
	);
};
