import { updateLaunchpadSettings } from '@automattic/data-stores';

type SkipLaunchpadProps = {
	checklistSlug?: string | null;
	setActiveChecklist: ( siteSlug: string, checklistSlug: string ) => Promise< unknown >;
	siteId: string | null;
	siteSlug: string | null;
};

export const skipLaunchpad = async ( {
	checklistSlug,
	setActiveChecklist,
	siteId,
	siteSlug,
}: SkipLaunchpadProps ) => {
	if ( siteSlug ) {
		if ( checklistSlug ) {
			// If we're making both API calls, allow them to happen concurrently.
			await Promise.allSettled( [
				updateLaunchpadSettings( siteSlug, { launchpad_screen: 'skipped' } ),
				setActiveChecklist( siteSlug, checklistSlug ),
			] );
		} else {
			await updateLaunchpadSettings( siteSlug, { launchpad_screen: 'skipped' } );
		}
	}

	return window.location.assign( `/home/${ siteId ?? siteSlug }` );
};
