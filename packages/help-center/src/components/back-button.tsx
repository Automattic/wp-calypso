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
	const isHelpCenterHome = key === 'default';

	const buttonClassName = clsx(
		'back-button__help-center help-center-header__text',
		{
			'back-button__help-center__drag': isHelpCenterHome,
		},
		className
	);

	function defaultOnClick() {
		// There's no where to navigate if users are already on home.
		if ( isHelpCenterHome ) {
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
		<span className={ buttonClassName }>
			<Icon
				onClick={ onClick || defaultOnClick }
				icon={ isHelpCenterHome ? <DragIcon /> : chevronLeft }
				size={ 18 }
			/>
			{ buttonText ?? defaultButtonText }
		</span>
	);
};
