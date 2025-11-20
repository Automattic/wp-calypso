import { Button } from '@wordpress/components';
import { Icon, chevronLeft } from '@wordpress/icons';
import { useNavigate, useLocation } from 'react-router-dom';

export const BackButton = () => {
	const navigate = useNavigate();
	const { pathname } = useLocation();

	function handleClick() {
		if ( pathname === '/' ) {
			// Already on home page, do nothing
			return;
		}
		navigate( -1 );
	}

	// Don't show back button on home page
	if ( pathname === '/' ) {
		return null;
	}

	return (
		<Button
			label="Go Back"
			onClick={ handleClick }
			onTouchStart={ handleClick }
			className="agents-manager__back-button"
		>
			<Icon icon={ chevronLeft } />
		</Button>
	);
};
