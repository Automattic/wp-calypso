import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { useTranslate } from 'i18n-calypso';
import { useEffect } from 'react';
import { wpcomJetpackLicensing as wpcomJpl } from 'calypso/lib/wp';
import { useDispatch } from 'calypso/state';
import { License } from 'calypso/state/partner-portal/types';
import { errorNotice } from '../../../notices/actions';
import { formatLicenses } from '../handlers';

export default function useBundleLicensesQuery(
	parentLicenseId: number
): UseQueryResult< License[] > {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const query = useQuery( {
		queryKey: [ 'partner-portal', 'bundle-licenses', parentLicenseId ],
		queryFn: () =>
			wpcomJpl.req.get(
				{
					apiNamespace: 'wpcom/v2',
					path: '/jetpack-licensing/licenses',
				},
				{
					parent_id: parentLicenseId,
				}
			),
		select: ( data ) => formatLicenses( data.items ),
	} );

	const { isError } = query;

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

	return query;
}
