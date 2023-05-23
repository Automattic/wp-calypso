import { isEnabled } from '@automattic/calypso-config';
import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { useTranslate } from 'i18n-calypso';
import wpcom from 'calypso/lib/wp';
import type { Category } from '../types';

const usePatternCategories = (
	siteId: undefined | number = 0,
	queryOptions: UseQueryOptions< any, unknown, Category[] > = {}
): Category[] => {
	const translate = useTranslate();
	const { data } = useQuery< any, unknown, Category[] >(
		[ siteId, 'block-patterns', 'categories' ],
		() => {
			return wpcom.req.get( {
				path: `/sites/${ encodeURIComponent( siteId ) }/block-patterns/categories`,
				apiNamespace: 'wp/v2',
			} );
		},
		{
			...queryOptions,
			staleTime: Infinity,
			enabled: !! siteId,
			meta: {
				persist: false,
				...queryOptions.meta,
			},
			select: ( data: Category[] ) => {
				if ( ! isEnabled( 'pattern-assembler/all-patterns-category' ) ) {
					return data;
				}
				return data.map( ( category ) => {
					if ( 'featured' === category.name ) {
						return {
							...category,
							label: translate( 'All' ),
							description: translate( 'Browse through all the patterns.' ),
						};
					}
					return category;
				} );
			},
		}
	);
	return data ?? [];
};

export default usePatternCategories;
