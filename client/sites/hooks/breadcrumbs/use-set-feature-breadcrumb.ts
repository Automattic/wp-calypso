import { useEffect } from 'react';
import { useDispatch } from 'calypso/state';
import { resetBreadcrumbs, updateBreadcrumbs } from 'calypso/state/breadcrumb/actions';

export function useSetFeatureBreadcrumb( {
	siteId,
	title,
}: {
	siteId: number | undefined;
	title: string;
} ) {
	const dispatch = useDispatch();
	useEffect( () => {
		dispatch(
			updateBreadcrumbs( [
				{
					id: 'feature',
					label: title,
				},
			] )
		);
		return () => {
			dispatch( resetBreadcrumbs() );
		};
	}, [ siteId, title ] ); // eslint-disable-line react-hooks/exhaustive-deps
}

export function FeatureBreadcrumb( {
	siteId,
	title,
}: {
	siteId: number | undefined;
	title: string;
} ) {
	useSetFeatureBreadcrumb( { siteId, title } );
	return null;
}
