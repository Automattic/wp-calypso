import { SITE_SETUP_FLOW } from '@automattic/onboarding';
import { addQueryArgs } from 'calypso/lib/url';

export const goToImporter = (
	platform: string,
	siteId: string,
	siteSlug: string,
	backToStep?: {
		step: string;
		flow: string;
	}
) => {
	return window.location.assign(
		addQueryArgs(
			{
				siteId,
				siteSlug,

				...( backToStep ? { backToFlow: `${ backToStep.flow }/${ backToStep.step }` } : {} ),
				...( platform === 'importerWordpress' ? { option: 'content' } : {} ),
			},
			`/setup/${ SITE_SETUP_FLOW }/${ platform }`
		)
	);
};
