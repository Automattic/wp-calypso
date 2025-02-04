import { RouteProps } from '../types';

type StateProps = {
	routes: RouteProps[];
};

export function getRoutes( state: StateProps ) {
	return state.routes;
}
