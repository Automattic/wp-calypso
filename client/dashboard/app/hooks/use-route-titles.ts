import { useRouterState } from '@tanstack/react-router';
import { useMemo } from 'react';

export const useRouteTitles = () => {
	const routeMeta = useRouterState( {
		select: ( state ) => state.matches.map( ( match ) => match.meta ).filter( Boolean ),
	} );

	return useMemo( () => {
		return routeMeta
			.map( ( metas ) => metas?.find( ( meta ) => meta?.title )?.title )
			.filter( ( value ) => typeof value !== 'undefined' )
			.reverse();
	}, [ routeMeta ] );
};
