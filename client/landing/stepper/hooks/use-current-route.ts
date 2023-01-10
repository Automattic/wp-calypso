import { useLocation } from 'react-router-dom';

export function useCurrentRoute() {
	const location = useLocation();

	return location.pathname.substring( 1 ) as string;
}
