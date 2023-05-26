import { isEnabled } from '@automattic/calypso-config';
import { useI18n } from '@wordpress/react-i18n';
import { useSelector } from 'react-redux';
import { addQueryArgs } from 'calypso/lib/url';
import getUserSetting from 'calypso/state/selectors/get-user-setting';
import { getImportSiteUrl, TRACK_SOURCE_NAME } from '../utils';
import { EmptyStateCTA } from './empty-state-cta';

export const CreateSiteCTA = () => {
	const { __ } = useI18n();
	const isDevAccount = useSelector( ( state ) => getUserSetting( state, 'is_dev_account' ) );

	const newSiteURL =
		isEnabled( 'hosting-onboarding-i2' ) && isDevAccount ? '/setup/new-hosted-site' : '/start';

	return (
		<EmptyStateCTA
			description={ __( 'Build a new site from scratch' ) }
			label={ __( 'Create a site' ) }
			target={ addQueryArgs( { source: TRACK_SOURCE_NAME, ref: 'calypso-nosites' }, newSiteURL ) }
		/>
	);
};

export const MigrateSiteCTA = () => {
	const { __ } = useI18n();

	return (
		<EmptyStateCTA
			description={ __( 'Bring a site to WordPress.com' ) }
			label={ __( 'Migrate a site' ) }
			target={ getImportSiteUrl() }
		/>
	);
};
