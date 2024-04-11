import { useQuery } from '@tanstack/react-query';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useEffect, useState } from 'react';
import wpcom from 'calypso/lib/wp';
import { useSelector, useDispatch } from 'calypso/state';
import { getActiveAgencyId } from 'calypso/state/a8c-for-agencies/agency/selectors';
import { errorNotice } from 'calypso/state/notices/actions';
import { License } from 'calypso/state/partner-portal/types';
import formatLicenses from './lib/format-licenses';

export default function useBundleLicenses(
	parentLicenseId: number,
	perPage: number = 25,
	sortField: string = 'status',
	sortDirection: string = 'asc'
) {
	const [ licenses, setLicenses ] = useState< License[] >( [] );
	const [ total, setTotal ] = useState< number >( 0 );
	const [ page, setPage ] = useState< number >( 1 );

	const translate = useTranslate();
	const dispatch = useDispatch();
	const agencyId = useSelector( getActiveAgencyId );

	const query = useQuery( {
		queryKey: [
			'partner-portal',
			'bundle-licenses',
			parentLicenseId,
			perPage,
			page,
			sortField,
			sortDirection,
			agencyId,
		],
		queryFn: () =>
			wpcom.req.get(
				{
					apiNamespace: 'wpcom/v2',
					path: '/jetpack-licensing/licenses',
				},
				{
					...( agencyId && { agency_id: agencyId } ),
					parent_id: parentLicenseId,
					page,
					per_page: perPage,
					sort_field: sortField,
					sort_direction: sortDirection,
				}
			),
		select: ( data ) => ( {
			total: data.total_items,
			licenses: formatLicenses( data.items ),
		} ),
		enabled: !! agencyId,
		refetchOnWindowFocus: false,
	} );

	const { isError, data, isLoading } = query;

	const loadMore = useCallback( () => {
		setPage( ( page ) => page + 1 );
	}, [] );

	useEffect( () => {
		if ( isError ) {
			dispatch(
				errorNotice(
					translate( 'We were unable to retrieve the license details. Please try again later.' ),
					{
						id: 'a4a-bundle-licenses-failure',
					}
				)
			);
		}
	}, [ dispatch, translate, isError ] );

	useEffect( () => {
		if ( data ) {
			setTotal( data.total ?? 0 );

			if ( page === 1 ) {
				setLicenses( data.licenses );
			} else {
				setLicenses( ( licenses ) => [ ...licenses, ...data.licenses ] );
			}
		}
	}, [ data, page ] );

	return {
		licenses,
		total,
		loadMore: licenses.length < total ? loadMore : undefined,
		isLoading,
	};
}
