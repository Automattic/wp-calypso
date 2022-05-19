import config from '@automattic/calypso-config';
import { useQuery } from 'react-query';
import wpcomRequest from 'wpcom-proxy-request';

type Result = {
	id: string;
	title: string;
	description: string;
	link: string;
};

const wpcomSupportBlog = config( 'wpcom_support_blog' ) as string;
const jetpackSupportBlog = config( 'jetpack_support_blog' ) as string;

export function useSibylQuery( query: string, isJetpackSite: boolean, isAtomic: boolean ) {
	const site = ! isJetpackSite || isAtomic ? wpcomSupportBlog : jetpackSupportBlog;

	return useQuery< Result[] >(
		query,
		async () =>
			await wpcomRequest( {
				path: '/help/qanda',
				apiVersion: '1.1',
				query: `query=${ encodeURIComponent( query ) }&site=${ encodeURIComponent( site ) }`,
			} ),
		{
			refetchOnWindowFocus: false,
			keepPreviousData: true,
		}
	);
}
