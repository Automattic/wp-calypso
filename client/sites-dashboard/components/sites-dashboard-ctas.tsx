import { useI18n } from '@wordpress/react-i18n';
import { useAddNewSiteUrl } from 'calypso/lib/paths/use-add-new-site-url';
import { useSitesDashboardImportSiteUrl } from '../hooks/use-sites-dashboard-import-site-url';
import { TRACK_SOURCE_NAME } from '../utils';
import { EmptyStateCTA } from './empty-state-cta';

interface SitesDashboardCTAProps {
	siteCount: number;
}

export const CreateSiteCTA = ( { siteCount }: SitesDashboardCTAProps ) => {
	const { __ } = useI18n();

	const createSiteUrl = useAddNewSiteUrl( {
		source: TRACK_SOURCE_NAME,
		ref: siteCount === 0 ? 'calypso-nosites' : null,
	} );

	return (
		<EmptyStateCTA
			description={ __( 'Build a new site from scratch' ) }
			label={ __( 'Create a site' ) }
			target={ createSiteUrl }
		/>
	);
};

export const MigrateSiteCTA = ( { siteCount }: SitesDashboardCTAProps ) => {
	const { __ } = useI18n();
	const importSiteUrl = useSitesDashboardImportSiteUrl( {
		ref: siteCount === 0 ? 'calypso-nosites' : null,
	} );

	return (
		<EmptyStateCTA
			description={ __( 'Bring a site to WordPress.com' ) }
			label={ __( 'Migrate a site' ) }
			target={ importSiteUrl }
		/>
	);
};
