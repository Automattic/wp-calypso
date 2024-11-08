import { Icon, chevronLeft } from '@wordpress/icons';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';

import './back-button.scss';

export const BackButton = () => {
	const navigate = useNavigate();
	const [ searchParams ] = useSearchParams();
	const { pathname } = useLocation();

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
			<Icon
				data-testid="back-button-icon"
				onClick={ handleClick }
				icon={ chevronLeft }
				size={ 18 }
			/>
		</span>
	);
};
