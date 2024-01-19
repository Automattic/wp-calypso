import { useQuery } from '@tanstack/react-query';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useEffect, useState } from 'react';
import { wpcomJetpackLicensing as wpcomJpl } from 'calypso/lib/wp';
import { useDispatch } from 'calypso/state';
import { License } from 'calypso/state/partner-portal/types';
import { errorNotice } from '../../../notices/actions';
import { formatLicenses } from '../handlers';

export default function useBundleLicensesQuery(
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

	const query = useQuery( {
		queryKey: [
			'partner-portal',
			'bundle-licenses',
			parentLicenseId,
			perPage,
			page,
			sortField,
			sortDirection,
		],
		queryFn: () =>
			wpcomJpl.req.get(
				{
					apiNamespace: 'wpcom/v2',
					path: '/jetpack-licensing/licenses',
				},
				{
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
						id: 'partner-portal-bundle-licenses-failure',
					}
				)
			);
		}
	}, [ dispatch, translate, isError ] );

	useEffect( () => {
		if ( data ) {
			setTotal( data.total );

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
