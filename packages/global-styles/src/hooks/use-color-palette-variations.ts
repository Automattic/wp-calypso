import { isEnabled } from '@automattic/calypso-config';
import { useQuery } from '@tanstack/react-query';
import wpcomRequest from 'wpcom-proxy-request';
import type { GlobalStylesObject } from '../types';

type Options = {
	enabled?: boolean;
};

const useColorPaletteVariations = ( stylesheet: string, { enabled = true }: Options = {} ) => {
	const { data } = useQuery< any, unknown, GlobalStylesObject[] >( {
		queryKey: [ 'global-styles-color-palette', stylesheet ],
		queryFn: async () =>
			wpcomRequest< GlobalStylesObject[] >( {
				path: `/global-styles-variation/color-palettes`,
				method: 'GET',
				apiNamespace: 'wpcom/v3',
				query: new URLSearchParams( {
					stylesheet,
					...( isEnabled( 'design-picker/use-assembler-styles' )
						? { base_variation_stylesheet: 'pub/assembler' }
						: {} ),
				} ).toString(),
			} ),
		refetchOnMount: 'always',
		staleTime: Infinity,
		enabled: !! stylesheet && enabled,
	} );

	return data;
};

export default useColorPaletteVariations;
