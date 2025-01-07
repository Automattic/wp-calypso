import { Button } from '@wordpress/components';
import { Icon, chevronLeft } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';

import './back-button.scss';

export const BackButton = () => {
	const navigate = useNavigate();
	const [ searchParams ] = useSearchParams();
	const { pathname } = useLocation();
	const { __ } = useI18n();

	function handleClick() {
		if ( pathname === '/success' ) {
			navigate( '/' );
		} else if ( searchParams.get( 'query' ) ) {
			navigate( `/?query=${ searchParams.get( 'query' ) }` );
		} else {
			navigate( -1 );
		}
	}

	return (
		<Button
			label={ __( 'Go Back', __i18n_text_domain__ ) }
			data-testid="help-center-back-button"
			onClick={ handleClick }
			onTouchStart={ handleClick }
			className="back-button__help-center"
		>
			<Icon icon={ chevronLeft } size={ 18 } />
		</Button>
	);
};
