import { createLazyRoute, createRoute } from '@tanstack/react-router';
import { StepperApp } from '../../../landing/stepper/stepper-app';
import { rootRoute } from './root';

const setupRoute = createRoute( {
	getParentRoute: () => rootRoute,
	path: 'setup',
} );

const setupSplatRoute = createRoute( {
	getParentRoute: () => setupRoute,
	path: '$',
} ).lazy( () =>
	Promise.resolve(
		createLazyRoute( 'setup-splat' )( {
			component: StepperApp,
		} )
	)
);

export const createSetupRoutes = () => {
	return [ setupRoute.addChildren( [ setupSplatRoute ] ) ];
};
