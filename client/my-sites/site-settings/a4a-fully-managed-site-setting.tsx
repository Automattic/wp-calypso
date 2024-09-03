import config from '@automattic/calypso-config';
import useFetchAgencyFromBlog from 'calypso/a8c-for-agencies/data/agencies/use-fetch-agency-from-blog';
import type { SiteDetails } from '@automattic/data-stores';

type Props = {
	site: SiteDetails;
};

export function A4AFullyManagedSiteSetting( { site }: Props ) {
	const devSitesEnabled = config.isEnabled( 'a4a-dev-sites' );
	const isDevSite = site.is_a4a_dev_site;
	const isAtomicSite = site.is_wpcom_atomic;

	const { data: agencySite } = useFetchAgencyFromBlog( site?.ID, { enabled: !! site?.ID } );

	const shouldShowToggle = devSitesEnabled && agencySite && isAtomicSite && ! isDevSite;

	if ( ! shouldShowToggle ) {
		return null;
	}

	return <div>Toogle</div>;
}
