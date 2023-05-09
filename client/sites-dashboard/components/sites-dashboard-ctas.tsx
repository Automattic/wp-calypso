import { isEnabled } from '@automattic/calypso-config';
import { useI18n } from '@wordpress/react-i18n';
import { addQueryArgs } from 'calypso/lib/url';
import {
	CreateSiteIcon,
	CREATE_SITE_ICON_SPARKLES,
	MigrateSiteIcon,
	MIGRATE_SITE_ICON_SPARKLES,
} from './sites-dashboard-cta-icons';
import { SparklingCTA } from './sparkling-cta';

export const CreateSiteCTA = () => {
	const { __ } = useI18n();

	const newSiteURL = isEnabled( 'hosting-onboarding-i2' ) ? '/setup/new-hosted-site' : '/start';

	return (
		<SparklingCTA
			label={ __( 'Create a site' ) }
			target={ addQueryArgs( { source: 'sites-dashboard', ref: 'calypso-nosites' }, newSiteURL ) }
			icon={ <CreateSiteIcon /> }
			sparkles={ CREATE_SITE_ICON_SPARKLES }
		/>
	);
};

export const MigrateSiteCTA = () => {
	const { __ } = useI18n();

	return (
		<SparklingCTA
			label={ __( 'Migrate a site' ) }
			target="/setup/import-focused"
			icon={ <MigrateSiteIcon /> }
			sparkles={ MIGRATE_SITE_ICON_SPARKLES }
		/>
	);
};
