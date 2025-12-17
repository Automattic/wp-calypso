import { useNavigate } from '@tanstack/react-router';
import { useAnalytics } from '../analytics';
import { useAuth } from '../auth';
import { useAppContext } from '../context';
import BaseHeader from './base-header';

/**
 * Header used in Multi Site Dashboard (v2).
 */
function Header() {
	const { user, logout } = useAuth();
	const { Logo, name } = useAppContext();
	const navigate = useNavigate();
	const { supports } = useAppContext();
	const { recordTracksEvent } = useAnalytics();

	/**
	 * Takes care of the JS navigation inside the header.
	 */
	function handleNavigation( path: string ): void {
		navigate( { to: path } );
	}

	return (
		<BaseHeader
			Logo={ Logo }
			appName={ name }
			supports={ supports }
			user={ user }
			navigateTo={ handleNavigation }
			logout={ logout }
			recordTracksEvent={ recordTracksEvent }
		/>
	);
}

export default Header;
