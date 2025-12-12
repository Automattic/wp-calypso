import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import wpcomRequest from 'wpcom-proxy-request';

export type AuthorizeMeta = {
	client: { id: number; title: string; icon?: string };
	user: null | {
		id: number;
		display_name: string;
		email: string;
		username?: string;
		avatar_URL?: string;
		site_count?: number;
	};
	permissions: Array< { name: string; description: string } >;
	links: {
		authorize: string;
		deny: string;
		logout: string;
		redirect_to: string;
		signup: string;
		wpcom_root: string;
		calypso_login_url?: string;
	};
	nonce: null | { _wpnonce: string };
	flags: { user_logged_in: boolean; require_email_verification: boolean };
};

type Props = { params: Record< string, string >; enabled?: boolean };

export default function useAuthorizeMeta( {
	params,
	enabled = true,
}: Props ): UseQueryResult< AuthorizeMeta > {
	const query = new URLSearchParams( params ).toString();

	return useQuery( {
		queryKey: [ 'oauth2-authorize-meta', query ],
		queryFn: async (): Promise< AuthorizeMeta > =>
			wpcomRequest( {
				path: '/oauth2/authorize/meta',
				apiVersion: '1.2',
				query,
			} ),
		staleTime: 30_000,
		enabled,
	} );
}
