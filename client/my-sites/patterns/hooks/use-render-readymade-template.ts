import { RenderedPattern } from '@automattic/block-renderer';
import { useQuery } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';
import { RENDERER_SITE_ID } from 'calypso/my-sites/patterns/constants';
import type { ReadymadeTemplate } from 'calypso/my-sites/patterns/types';

export const useRenderReadymadeTemplate = ( readymadeTemplate: ReadymadeTemplate ) =>
	useQuery< { [ key: string ]: RenderedPattern } >( {
		queryKey: [ 'pattern-library', 'readymade-template', readymadeTemplate.template_id, 'render' ],
		queryFn() {
			return wpcom.req.get(
				{
					path: `/sites/${ RENDERER_SITE_ID }/block-renderer/patterns/render`,
					apiNamespace: 'wpcom/v2',
				},
				{
					pattern_ids: readymadeTemplate.patterns.map( ( { id } ) => id ).join( ',' ),
					site_title: readymadeTemplate.title,
				}
			);
		},
		staleTime: 5 * 60 * 1000,
	} );
