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
		<span className="back-button__help-center">
			<Button
				tabIndex={ 0 }
				data-testid="back-button-icon"
				onClick={ handleClick }
				className="back-button__help-center"
			>
				<Icon
					aria-label={ __( 'Go Back', __i18n_text_domain__ ) }
					icon={ chevronLeft }
					size={ 18 }
				/>
			</Button>
		</span>
	);
};
