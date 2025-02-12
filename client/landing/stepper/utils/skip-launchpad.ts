import { updateLaunchpadSettings } from '@automattic/data-stores';

type SkipLaunchpadProps = {
	siteId: string | number | null;
	siteSlug: string | null;
	redirectToHome?: boolean;
};

export const skipLaunchpad = async ( {
	siteId,
	siteSlug,
	redirectToHome = true,
}: SkipLaunchpadProps ) => {
	const siteIdOrSlug = siteId || siteSlug;
	if ( siteIdOrSlug ) {
		await updateLaunchpadSettings( siteIdOrSlug, { launchpad_screen: 'skipped' } );
	}

	if ( redirectToHome ) {
		return window.location.assign( `/home/${ siteIdOrSlug }` );
	}
};
