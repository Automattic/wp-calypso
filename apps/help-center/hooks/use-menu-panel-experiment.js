import apiFetch from '@wordpress/api-fetch';
import { useEffect, useState } from '@wordpress/element';
import { addQueryArgs } from '@wordpress/url';
import wpcomRequest, { canAccessWpcomApis } from 'wpcom-proxy-request';

const useMenuPanelExperiment = (
	experimentName = 'international_pricing_2025',
	treatmentVariation = 'treatment'
) => {
	const [ isMenuPanelExperimentEnabled, setIsMenuPanelExperimentEnabled ] = useState( false );

	useEffect( () => {
		const fetchExperimentAssignment = async () => {
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

			setIsMenuPanelExperimentEnabled(
				result.variations?.[ experimentName ] === treatmentVariation
			);
		};
		fetchExperimentAssignment();
	}, [] );

	return isMenuPanelExperimentEnabled;
};

export { useMenuPanelExperiment };
