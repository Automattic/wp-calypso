import type { Preference } from 'calypso/jetpack-cloud/sections/agency-dashboard/sites-overview/types';

const ONE_DAY_IN_MILLISECONDS = 1000 * 60 * 60 * 24;

interface Banner {
	component: () => JSX.Element;
	preference: Preference;
	showDays?: number;
	hideBanner?: boolean;
}

const shouldShowBanner = ( banner: Banner ) => {
	if ( ! banner.preference?.view_date ) {
		return true;
	}
	const currentDate = new Date() as unknown as number;
	const daysDifference = Math.floor(
		( currentDate - Number( banner.preference.view_date ) ) / ONE_DAY_IN_MILLISECONDS
	);
	// Show banner only for the specified number of days
	if ( banner.showDays ) {
		return daysDifference <= banner.showDays;
	}
	return true;
};

const showBanner = ( banners: Banner[] ) => {
	// Find the banner which is not dismissed and has not been viewed in the last 7 days (if showDays is specified)
	const banner = banners.find(
		( banner ) => ! banner.preference?.dismiss && ! banner.hideBanner && shouldShowBanner( banner )
	);

	return banner?.component?.() ?? null;
};

export default showBanner;
