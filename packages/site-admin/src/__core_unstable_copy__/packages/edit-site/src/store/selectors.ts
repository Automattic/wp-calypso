/**
 * Internal dependencies
 */
import { Route } from '../../../router/src';

type StateProps = {
	routes: Route[];
};

export function getRoutes( state: StateProps ) {
	return state.routes;
}
