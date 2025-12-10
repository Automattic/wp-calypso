import { useQuery } from '@tanstack/react-query';
import apiFetch from '@wordpress/api-fetch';
import { addQueryArgs } from '@wordpress/url';
import wpcomRequest, { canAccessWpcomApis } from 'wpcom-proxy-request';

// Define the bot slug and version mapping for different experiment variants
const experimentName = 'wpcom_help_center_ai_workflow_variations';
const botSlugMap = {
	control: {
		slug: 'wpcom-support-chat',
		version: undefined,
	},
};

// Check if we have any non-control variants, this will ease the AB testing logic by just adding new variants to the map
const hasExperimentalVariants = () => {
	return Object.keys( botSlugMap ).some( ( key ) => key !== 'control' );
};

export function useNewInteractionsBotConfig() {
	const shouldUseExperiment = hasExperimentalVariants();

	const query = useQuery( {
		queryKey: [ 'new-interactions-bot-slug', experimentName ],
		staleTime: 10 * 60 * 1000, // 10 minutes
		enabled: shouldUseExperiment,
		queryFn: () =>
			canAccessWpcomApis()
				? wpcomRequest< { variations: Record< typeof experimentName, keyof typeof botSlugMap > } >(
						{
							path: '/experiments/0.1.0/assignments/wpcom',
							apiNamespace: 'wpcom/v2',
							query: {
								experiment_name: experimentName,
							},
						}
				  )
				: apiFetch< { variations: Record< typeof experimentName, keyof typeof botSlugMap > } >( {
						path: addQueryArgs( 'jetpack/v4/explat/assignments', {
							experiment_name: experimentName,
							platform: 'wpcom',
							as_connected_user: 'true',
						} ),
				  } ),
	} );

	// If no experimental variants, return control immediately
	if ( ! shouldUseExperiment ) {
		return {
			newInteractionsBotSlug: botSlugMap.control.slug,
			newInteractionsBotVersion: botSlugMap.control.version,
		};
	}

	// Use experiment data when available
	if ( query.data?.variations && experimentName in query.data.variations ) {
		// null -> control
		const variant = query.data.variations[ experimentName ] ?? 'control';
		const botSlug = botSlugMap[ variant ]?.slug;
		const version = botSlugMap[ variant ]?.version;

		return {
			newInteractionsBotSlug: botSlug,
			newInteractionsBotVersion: version,
		};
	}

	return {};
}
