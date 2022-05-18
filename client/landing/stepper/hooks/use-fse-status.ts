import { useQuery } from 'react-query';
import wpcomRequest from 'wpcom-proxy-request';
import { useSite } from './use-site';

type Response = {
	is_fse_eligible: boolean;
	is_fse_active: boolean;
};

export function useFSEStatus() {
	const site = useSite();

	const { data, isLoading } = useQuery< Response >(
		site?.ID.toString() ?? 'no-site',
		() =>
			wpcomRequest( {
				path: `/sites/${ site?.ID }/block-editor`,
				apiNamespace: 'wpcom/v2',
			} ),
		{
			enabled: !! site,
		}
	);

	return {
		FSEEligible: Boolean( data?.is_fse_eligible ),
		FSEActive: Boolean( data?.is_fse_active ),
		isLoading,
	};
}
