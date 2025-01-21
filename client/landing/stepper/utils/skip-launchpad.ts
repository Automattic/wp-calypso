import { updateLaunchpadSettings } from '@automattic/data-stores';

type SkipLaunchpadProps = {
	siteId: string | number | null;
	siteSlug: string | null;
};

export const skipLaunchpad = async ( { siteId, siteSlug }: SkipLaunchpadProps ) => {
	const siteIdOrSlug = siteId || siteSlug;
	if ( siteIdOrSlug ) {
		await updateLaunchpadSettings( siteIdOrSlug, { launchpad_screen: 'skipped' } );
	}

	return window.location.assign( `/home/${ siteIdOrSlug }` );
};
