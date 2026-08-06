import SiteConfigurationsModal from 'calypso/a8c-for-agencies/components/site-configurations-modal';
import { useRandomSiteName } from 'calypso/a8c-for-agencies/components/site-configurations-modal/use-random-site-name';
import useSiteCreatedCallback from 'calypso/a8c-for-agencies/hooks/use-site-created-callback';

type Props = {
	siteId: number;
	closeModal: () => void;
};

/**
 * Wraps the site configuration modal so `useRandomSiteName` — two uncached
 * requests on mount — only runs once the modal opens, rather than once per
 * license row on the licenses page.
 */
export default function LicenseSiteConfigurationsModal( { siteId, closeModal }: Props ) {
	const { randomSiteName, isRandomSiteNameLoading, refetchRandomSiteName } = useRandomSiteName();
	const onCreateSiteSuccess = useSiteCreatedCallback( refetchRandomSiteName );

	return (
		<SiteConfigurationsModal
			closeModal={ closeModal }
			randomSiteName={ randomSiteName }
			isRandomSiteNameLoading={ isRandomSiteNameLoading }
			siteId={ siteId }
			onCreateSiteSuccess={ onCreateSiteSuccess }
		/>
	);
}
