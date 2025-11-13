import { useQuery } from '@tanstack/react-query';
import apiFetch from '@wordpress/api-fetch';
import { addQueryArgs } from '@wordpress/url';
import wpcomRequest, { canAccessWpcomApis } from 'wpcom-proxy-request';

const fetchExperimentAssignment = async ( experimentName ) => {
	const result = canAccessWpcomApis()
		? await wpcomRequest( {
				path: '/experiments/0.1.0/assignments/calypso',
				apiNamespace: 'wpcom/v2',
				query: {
					experiment_name: experimentName,
				},
		  } )
		: await apiFetch( {
				path: addQueryArgs( 'jetpack/v4/explat/assignments', {
					experiment_name: experimentName,
					platform: 'calypso',
					as_connected_user: 'true',
				} ),
				global: true,
		  } );

	return result;
};

const useMenuPanelExperiment = (
	experimentName = 'calypso_help_center_menu_popover',
	treatmentVariation = 'menu_popover'
) => {
	const { data } = useQuery( {
		queryKey: [ 'experimentAssignmentt', experimentName ],
		queryFn: () => fetchExperimentAssignment( experimentName ),
		staleTime: 5 * 60 * 1000, // 5 minutes
	} );

	return data?.variations?.[ experimentName ] === treatmentVariation;
};

export { useMenuPanelExperiment };
