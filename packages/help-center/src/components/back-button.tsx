import { Icon, chevronLeft } from '@wordpress/icons';
import clsx from 'clsx';
import { useNavigate, useSearchParams } from 'react-router-dom';

import './back-button.scss';

export type BackButtonProps = {
	onClick?: () => void;
	backToRoot?: boolean;
	className?: string;
	children?: React.ReactNode;
};

export const BackButton = ( { onClick, backToRoot = false, className }: BackButtonProps ) => {
	const navigate = useNavigate();
	const [ searchParams ] = useSearchParams();

	const buttonClassName = clsx( 'back-button__help-center', className );

	function defaultOnClick() {
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
				data-testid="back-button-icon"
				onClick={ onClick || defaultOnClick }
				icon={ chevronLeft }
				size={ 18 }
			/>
		</span>
	);
};
