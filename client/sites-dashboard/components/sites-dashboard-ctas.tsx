import { useI18n } from '@wordpress/react-i18n';
import { addQueryArgs } from '@wordpress/url';
import { useSitesDashboardCreateSiteUrl } from '../hooks/use-sites-dashboard-create-site-url';
import { TRACK_SOURCE_NAME } from '../utils';
import { EmptyStateCTA } from './empty-state-cta';

export const CreateSiteCTA = () => {
	const { __ } = useI18n();
	const createSiteUrl = useSitesDashboardCreateSiteUrl();

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

	return (
		<EmptyStateCTA
			description={ __( 'Bring a site to WordPress.com' ) }
			label={ __( 'Migrate a site' ) }
			target={ addQueryArgs( '/setup/import-focused', { source: TRACK_SOURCE_NAME } ) }
		/>
	);
};
