import { useQuery } from '@tanstack/react-query';
import { useEffect } from '@wordpress/element';
import { decodeEntities } from '@wordpress/html-entities';
import wpcomRequest from 'wpcom-proxy-request';
import { useAgentsManagerContext } from '../contexts';
import type { SitePanelItem } from '../utils/site-panel-content';

/** Resolves unlabeled editor references in one site-scoped batch, preserving reply link text. */
export function useSitePanelTitles( items: SitePanelItem[] ) {
	const { site, currentUser } = useAgentsManagerContext();
	const ids = [
		...new Set(
			items.filter( ( item ) => ! item.hasTitle && item.postId ).map( ( item ) => item.postId! )
		),
	].sort( ( a, b ) => a - b );
	const { data, error } = useQuery( {
		queryKey: [ 'agents-manager-site-panel-titles', site?.ID, currentUser?.ID, ids ],
		enabled: !! site && ids.length > 0,
		queryFn: ( { signal } ) =>
			wpcomRequest< { posts: { ID: number; title: string; type: string }[] } >( {
				path: `/sites/${ site!.ID }/posts`,
				apiVersion: '1.1',
				query: {
					include: ids.join( ',' ),
					fields: 'ID,title,type',
					type: 'any',
					status: 'any',
					number: ids.length,
				},
				signal,
			} ),
	} );
	useEffect( () => {
		if ( error ) {
			// eslint-disable-next-line no-console
			console.error( '[AgentsManager] Could not load site panel titles:', error );
		}
	}, [ error ] );
	return items.map( ( item ) => {
		const post =
			! item.hasTitle && data?.posts.find( ( candidate ) => candidate.ID === item.postId );
		return post && post.title
			? { ...item, title: decodeEntities( post.title ), hasTitle: true }
			: item;
	} );
}
