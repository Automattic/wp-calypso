import { useRouterState } from '@tanstack/react-router';
import { useMemo } from 'react';
import { PageHeader } from '../page-header';
import type { RouterPageHeaderProps } from './types';

/**
 * The RouterPageHeader component automatically sets a default title by
 * retrieving it from the meta property of the last matched route.
 */
export const RouterPageHeader = ( props: RouterPageHeaderProps ) => {
	const routeMeta = useRouterState( {
		select: ( state ) => state.matches.map( ( match ) => match.meta ).filter( Boolean ),
	} );

	const title = useMemo( () => {
		return routeMeta
			.map( ( metas ) => metas?.find( ( meta ) => meta?.title )?.title )
			.filter( ( value ) => typeof value !== 'undefined' )
			.reverse()
			.slice( 0, 1 );
	}, [ routeMeta ] );

	return <PageHeader title={ title } { ...props } />;
};
