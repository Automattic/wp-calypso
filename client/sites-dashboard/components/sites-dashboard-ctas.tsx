import { isEnabled } from '@automattic/calypso-config';
import { useI18n } from '@wordpress/react-i18n';
import { useSelector } from 'react-redux';
import { addQueryArgs } from 'calypso/lib/url';
import getUserSetting from 'calypso/state/selectors/get-user-setting';
import { EmptyStateCTA } from './empty-state-cta';

export const CreateSiteCTA = () => {
	const { __ } = useI18n();
	const isDevAccount = useSelector( ( state ) => getUserSetting( state, 'is_dev_account' ) );

	const newSiteURL =
		isEnabled( 'hosting-onboarding-i2' ) && isDevAccount ? '/setup/new-hosted-site' : '/start';

	return (
		<EmptyStateCTA
			heading={ __( 'New site' ) }
			description={ __( 'Build a new site from scratch' ) }
			cta={ __( 'Create a site' ) }
			target={ addQueryArgs( { source: 'sites-dashboard', ref: 'calypso-nosites' }, newSiteURL ) }
		/>
	);
};

export const MigrateSiteCTA = () => {
	const { __ } = useI18n();

	return (
		<EmptyStateCTA
			heading={ __( 'Existing site' ) }
			description={ __( 'Bring an existing site to WordPress.com' ) }
			cta={ __( 'Migrate a site' ) }
			target="/setup/import-focused"
		/>
	);
};
