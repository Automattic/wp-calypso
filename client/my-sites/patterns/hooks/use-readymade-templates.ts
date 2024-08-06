import { useQuery } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';
import type { ReadymadeTemplate } from 'calypso/my-sites/patterns/types';

export const useReadymadeTemplates = () =>
	useQuery< ReadymadeTemplate[] >( {
		queryKey: [ 'pattern-library', 'readymade-templates-4' ],
		queryFn() {
			return wpcom.req.get( {
				path: '/themes/readymade-templates',
				apiNamespace: 'wpcom/v2',
			} );
		},
		staleTime: 5 * 60 * 1000,
	} );
