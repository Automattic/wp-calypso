import { useLocation } from 'react-router-dom';
import { StepPath } from '../declarative-flow/internals/steps-repository';

export function useCurrentRoute() {
	const location = useLocation();

	return location.pathname.substring( 1 ) as StepPath;
}
