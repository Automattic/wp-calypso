import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';

/**
 *
 * @param siteSlug The site whose storage upgrade URL should be returned
 * @returns A Calypso Blue- or Green-relative URL that points to the Jetpack storage upgrade page;
 * 			or, if no site is selected, an empty URL ("#").
 */
const getJetpackStorageUpgradeUrl = ( siteSlug: string | null ): string => {
	if ( ! siteSlug ) {
		return '#';
	}

	return isJetpackCloud() ? `/pricing/storage/${ siteSlug }` : `/plans/storage/${ siteSlug }`;
};

export default getJetpackStorageUpgradeUrl;
