import { isEnabled } from '@automattic/calypso-config';
import { LaunchpadNavigator, updateLaunchpadSettings } from '@automattic/data-stores';
import { dispatch } from '@wordpress/data';

type SkipLaunchpadProps = {
	checklistSlug?: string | null;
	siteId: string | number | null;
	siteSlug: string | null;
};

export const skipLaunchpad = async ( { checklistSlug, siteId, siteSlug }: SkipLaunchpadProps ) => {
	const siteIdOrSlug = siteId || siteSlug;
	if ( siteIdOrSlug ) {
		// Only set the active checklist if we have the checklist slug AND the feature is enabled.
		if ( checklistSlug && isEnabled( 'launchpad/navigator' ) ) {
			// If we're making both API calls, allow them to happen concurrently.
			await Promise.allSettled( [
				updateLaunchpadSettings( siteIdOrSlug, { launchpad_screen: 'skipped' } ),
				dispatch( LaunchpadNavigator.store ).setActiveChecklist(
					String( siteIdOrSlug ),
					checklistSlug
				),
			] );
		} else {
			await updateLaunchpadSettings( siteIdOrSlug, { launchpad_screen: 'skipped' } );
		}
	}

	return window.location.assign( `/home/${ siteIdOrSlug }` );
};
