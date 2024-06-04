import { Button } from '@wordpress/components';
import { Icon, chevronLeft } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import clsx from 'clsx';
import { useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../styles.scss';

export type Props = { onClick?: () => void; backToRoot?: boolean; className?: string };

export const BackButton = ( { onClick, backToRoot = false, className }: Props ) => {
	const { __ } = useI18n();
	const location = useLocation();
	const navigate = useNavigate();
	const buttonClassName = clsx( 'back-button__help-center', className );
	const buttonRef = useRef();

	function defaultOnClick() {
		if ( backToRoot ) {
			navigate( '/' );
		} else if ( location.key === 'default' ) {
			// Workaround to detect when we don't have prior history
			// https://github.com/remix-run/react-router/discussions/9922#discussioncomment-4722480
			navigate( '/' );
		} else {
			navigate( -1 );
		}
	}

	useEffect( () => {
		buttonRef.current?.focus?.();
	}, [] );

	return (
		<Button className={ buttonClassName } ref={ buttonRef } onClick={ onClick || defaultOnClick }>
			<Icon icon={ chevronLeft } size={ 18 } />
			{ __( 'Back', __i18n_text_domain__ ) }
		</Button>
	);
};
