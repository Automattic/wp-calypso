/**
 * External dependencies
 */
import { useDispatch } from '@wordpress/data';
import { useEffect, useMemo } from '@wordpress/element';
import { store } from '../../__core_unstable_copy__/packages/edit-site/src';
import type { Route } from '../../__core_unstable_copy__/packages/router/src';

export default function useRegisterRoutes( routes: Route[] = [] ) {
	const { registerRoute } = useDispatch( store );

	const memoizedRoutes = useMemo( () => routes, [ routes ] );

	useEffect( () => {
		if ( ! memoizedRoutes.length ) {
			return;
		}

		memoizedRoutes.forEach( registerRoute );
	}, [ registerRoute, memoizedRoutes ] );
}
