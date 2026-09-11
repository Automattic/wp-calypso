/**
 * How each step came to mount, for the wait heartbeat to report.
 *
 * The processing step is seen mounting twice for one signup in production, a second or less
 * apart and only for translated locales, and the second mount reruns the pending action. Nothing
 * in the events says what the second mount is. Two facts narrow it: which component type the
 * renderer handed React for the step (`lazy()` wrapper or the raw component, since the preloader
 * and the renderer share one cache and can disagree), and how long after the route mounted the
 * step itself did (a remount inside a mounted route lands well after the route did).
 *
 * Module state rather than context because the renderer, the route, and the step are three
 * components with nothing in common but the step slug.
 */
export type StepComponentType = 'lazy' | 'raw';

const componentTypes = new Map< string, StepComponentType >();
const routeMounts = new Map< string, number >();

export function componentTypeOf( component: unknown ): StepComponentType {
	return ( component as { $$typeof?: symbol } | null )?.$$typeof === Symbol.for( 'react.lazy' )
		? 'lazy'
		: 'raw';
}

export function recordStepComponentType( slug: string, type: StepComponentType ): void {
	componentTypes.set( slug, type );
}

export function recordStepRouteMount( slug: string ): void {
	routeMounts.set( slug, performance.now() );
}

export function describeStepMount( slug: string ): {
	step_component_type: StepComponentType | null;
	ms_since_route_mount: number | null;
} {
	const mountedAt = routeMounts.get( slug );
	return {
		step_component_type: componentTypes.get( slug ) ?? null,
		ms_since_route_mount:
			mountedAt === undefined ? null : Math.round( performance.now() - mountedAt ),
	};
}
