import { useI18n } from '@wordpress/react-i18n';
import { useAddNewSiteUrl } from 'calypso/lib/paths/use-add-new-site-url';
import { useSitesDashboardImportSiteUrl } from '../hooks/use-sites-dashboard-import-site-url';
import { TRACK_SOURCE_NAME } from '../utils';
import { EmptyStateCTA } from './empty-state-cta';

export const CreateSiteCTA = () => {
	const { __ } = useI18n();

	const createSiteUrl = useAddNewSiteUrl( {
		source: TRACK_SOURCE_NAME,
		ref: 'calypso-nosites',
	} );

	return (
		<EmptyStateCTA
			description={ __( 'Build a new site from scratch' ) }
			label={ __( 'Create a site' ) }
			target={ createSiteUrl }
		/>
	);
};

export const MigrateSiteCTA = () => {
	const { __ } = useI18n();
	const importSiteUrl = useSitesDashboardImportSiteUrl( {
		ref: 'calypso-nosites',
	} );

	return (
		<EmptyStateCTA
			description={ __( 'Bring a site to WordPress.com' ) }
			label={ __( 'Migrate a site' ) }
			target={ importSiteUrl }
		/>
	);
};
