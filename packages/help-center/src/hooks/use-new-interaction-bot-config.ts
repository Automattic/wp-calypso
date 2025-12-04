import { useQuery } from '@tanstack/react-query';
import apiFetch from '@wordpress/api-fetch';
import { addQueryArgs } from '@wordpress/url';
import wpcomRequest, { canAccessWpcomApis } from 'wpcom-proxy-request';

const botSlugMap = {
	control: {
		slug: 'wpcom-support-chat',
		version: undefined, // Get active version
	},
	workflow: {
		slug: 'wpcom-workflow-support_chat',
		version: undefined, // Get active version
	},
	workflow_iteration: {
		slug: 'wpcom-workflow-support_chat',
		version: '1.1.1', // Workflow iteration version
	},
};

export function useNewInteractionsBotConfig() {
	const experimentName = 'wpcom_help_center_ai_workflow_variations';
	const query = useQuery( {
		queryKey: [ 'new-interactions-bot-slug', experimentName ],
		staleTime: 10 * 60 * 1000, // 10 minutes
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
