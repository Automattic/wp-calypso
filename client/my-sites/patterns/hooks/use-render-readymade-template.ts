import { useQuery } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';
import { RENDERER_SITE_ID } from 'calypso/my-sites/patterns/constants';
import type { ReadymadeTemplate } from 'calypso/my-sites/patterns/types';

// Shouldnt have to do this.
function makeSlug( text: string ) {
	return text
		.trim()
		.toLowerCase()
		.replace( /[^a-z0-9]+/g, '-' )
		.replace( /^-+|-+$/g, '' ); // remove runs of dashes and trailing dashes
}

export const useRenderReadymadeTemplate = ( readymadeTemplate: ReadymadeTemplate ) =>
	useQuery( {
		queryKey: [ 'pattern-library', 'readymade-template', readymadeTemplate.template_id, 'render' ],
		queryFn() {
			const x = wpcom.req.post(
				{
					path: `/sites/${ RENDERER_SITE_ID }/block-renderer/content/render`,
					apiNamespace: 'wpcom/v2',
					method: 'POST',
				},
				{
					site_title: readymadeTemplate.title,
					variations: [ readymadeTemplate?.styles?.colors, readymadeTemplate?.styles?.typography ]
						.filter( Boolean )
						.map( ( value ) => makeSlug( value as string ) ),
				},
				{
					content:
						readymadeTemplate.home?.header +
						readymadeTemplate.home?.content +
						readymadeTemplate.home?.footer,
				}
			);
			return x;
		},
		staleTime: 5 * 60 * 1000,
	} );
