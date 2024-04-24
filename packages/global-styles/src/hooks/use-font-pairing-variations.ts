import { isEnabled } from '@automattic/calypso-config';
import { useQuery } from '@tanstack/react-query';
import wpcomRequest from 'wpcom-proxy-request';
import type { GlobalStylesObject } from '../types';

type Options = {
	enabled?: boolean;
	base_variation_stylesheet?: string;
};

const useFontPairingVariations = (
	siteId: number | string,
	stylesheet: string,
	{ enabled = true }: Options = {}
) => {
	const { data } = useQuery< any, unknown, GlobalStylesObject[] >( {
		queryKey: [ 'global-styles-font-pairings', siteId, stylesheet ],
		queryFn: async () =>
			wpcomRequest< GlobalStylesObject[] >( {
				path: `/sites/${ encodeURIComponent( siteId ) }/global-styles-variation/font-pairings`,
				method: 'GET',
				apiNamespace: 'wpcom/v2',
				query: new URLSearchParams( {
					stylesheet,
					...( isEnabled( 'design-picker/use-assembler-styles' )
						? { base_variation_stylesheet: 'pub/assembler' }
						: {} ),
				} ).toString(),
			} ),
		refetchOnMount: 'always',
		staleTime: Infinity,
		enabled: !! siteId && !! stylesheet && enabled,
	} );

	return data;
};

export default useFontPairingVariations;
