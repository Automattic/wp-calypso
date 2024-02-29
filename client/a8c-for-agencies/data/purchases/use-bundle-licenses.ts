import config from '@automattic/calypso-config';
import { useQuery } from '@tanstack/react-query';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useEffect, useState } from 'react';
import { useDispatch } from 'calypso/state';
import { errorNotice } from 'calypso/state/notices/actions';
import { License } from 'calypso/state/partner-portal/types';

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

	const showDummyData = config.isEnabled( 'a4a/mock-api-data' );

	const getBundleLicenses = () => {
		if ( showDummyData ) {
			return {
				items: [
					{
						licenseId: 1,
						licenseKey: 'license-key',
						product: 'dummy-product',
						blogId: 1,
						siteUrl: 'https://test.jurassic.ninja',
						hasDownloads: true,
						issuedAt: '2021-01-01',
						attachedAt: '2021-01-01',
						quantity: undefined,
						revokedAt: null,
						ownerType: 'jetpack_partner_key',
						parentLicenseId: null,
					},
					{
						licenseId: 2,
						licenseKey: 'license-key-2',
						product: 'dummy-product',
						blogId: 1,
						siteUrl: 'https://test.jurassic.ninja',
						hasDownloads: true,
						issuedAt: '2021-01-01',
						attachedAt: '2021-01-01',
						quantity: undefined,
						revokedAt: null,
						ownerType: 'jetpack_partner_key',
						parentLicenseId: null,
					},
				],
				total_items: 1,
			};
		}
		return {
			items: [],
			total_pages: 0,
		}; // FIXME: This is a placeholder for the actual API call.
	};

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
		queryFn: () => getBundleLicenses(),
		select: ( data ) => ( {
			total: data.total_items,
			licenses: data.items,
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
				// FIXME: Remove the type assertion once the API is implemented.
				setLicenses( data.licenses as License[] );
			} else {
				// FIXME: Remove the type assertion once the API is implemented.
				setLicenses( ( licenses ) => [ ...licenses, ...data.licenses ] as License[] );
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
