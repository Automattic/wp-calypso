import { Button } from '@wordpress/components';
import { Icon, chevronLeft } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import clsx from 'clsx';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { DragIcon } from '../icons';

import './back-button.scss';

export type BackButtonProps = {
	onClick?: () => void;
	backToRoot?: boolean;
	className?: string;
	children?: React.ReactNode;
	buttonText?: string;
};

export const BackButton = ( {
	onClick,
	backToRoot = false,
	className,
	buttonText,
}: BackButtonProps ) => {
	const { __ } = useI18n();
	const defaultButtonText = __( 'Back', __i18n_text_domain__ );
	const { key } = useLocation();
	const navigate = useNavigate();
	const [ searchParams ] = useSearchParams();
	const buttonClassName = clsx( 'back-button__help-center help-center-header__text', className );

	function defaultOnClick() {
		if ( key === 'default' ) {
			return;
		}
		if ( backToRoot ) {
			navigate( '/' );
		} else if ( searchParams.get( 'query' ) ) {
			navigate( `/?query=${ searchParams.get( 'query' ) }` );
		} else {
			navigate( -1 );
		}
	}

	return (
		<Button className={ buttonClassName } onClick={ onClick || defaultOnClick }>
			<Icon icon={ key === 'default' ? <DragIcon /> : chevronLeft } size={ 18 } />
			{ buttonText ?? defaultButtonText }
		</Button>
	);
};
