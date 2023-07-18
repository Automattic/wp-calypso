import { ReactElement, useCallback } from 'react';
import type { Preference } from 'calypso/jetpack-cloud/sections/agency-dashboard/sites-overview/types';

interface Banner {
	component: () => ReactElement;
	preference: Preference;
	showDays?: number;
	hideBanner?: boolean;
}

// Hook to show banner based on priority and preference(dismiss/view date)
export const useShowBanners = ( banners: Array< Banner > ) => {
	const showBanner = useCallback( ( banner: Banner ) => {
		if ( ! banner.preference?.view_date ) {
			return true;
		}
		const currentDate = new Date() as unknown as number;
		const daysDifference = Math.floor(
			( currentDate - Number( banner.preference.view_date ) ) / ( 1000 * 60 * 60 * 24 )
		);
		// Show banner only for the specified number of days
		if ( banner.showDays ) {
			return daysDifference <= banner.showDays;
		}
		return true;
	}, [] );

	// Find the banner which is not dismissed and has not been viewed in the last 7 days(if showDays is specified)
	const banner = useCallback( () => {
		return banners.find(
			( banner ) => ! banner.preference?.dismiss && ! banner.hideBanner && showBanner( banner )
		);
	}, [ banners, showBanner ] )();

	if ( banner ) {
		return banner.component();
	}
	return null;
};
