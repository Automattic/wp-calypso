import { useQuery } from '@tanstack/react-query';
import { addQueryArgs } from '@wordpress/url';
import wpcom from 'calypso/lib/wp';
import type { ReadymadeTemplate } from 'calypso/my-sites/patterns/types';

export const useReadymadeTemplates = () =>
	useQuery< ReadymadeTemplate[] >( {
		queryKey: [ 'pattern-library', 'readymade-templates' ],
		queryFn() {
			return wpcom.req.get( {
				path: '/themes/readymade-templates',
				apiNamespace: 'wpcom/v2',
			} );
		},
		staleTime: 5 * 60 * 1000,
		select: ( readymadeTemplates ) =>
			readymadeTemplates.map( ( readymadeTemplate ) => {
				const previewUrl = addQueryArgs( 'https://dotcompatterns.wordpress.com', {
					readymade_templates: readymadeTemplate.slug,
					iframe: true,
					theme_preview: true,
					preview: true,
				} );
				return {
					...readymadeTemplate,
					previewUrl,
				};
			} ),
	} );
