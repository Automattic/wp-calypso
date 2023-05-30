import { useI18n } from '@wordpress/react-i18n';
import { useSelector } from 'react-redux';
import { addQueryArgs } from 'calypso/lib/url';
import getCurrentQueryArguments from 'calypso/state/selectors/get-current-query-arguments';
import getUserSetting from 'calypso/state/selectors/get-user-setting';
import { EmptyStateCTA } from './empty-state-cta';

export const CreateSiteCTA = () => {
	const { __ } = useI18n();
	const isDevAccount = useSelector( ( state ) => getUserSetting( state, 'is_dev_account' ) );
	const isHostingFlow = useSelector(
		( state ) => getCurrentQueryArguments( state )?.[ 'hosting-flow' ] === 'true'
	);

	const newHostedSiteURL = isHostingFlow
		? addQueryArgs( { 'hosting-flow': true }, '/setup/new-hosted-site' )
		: '/setup/new-hosted-site';

	const newSiteURL = isDevAccount ? newHostedSiteURL : '/start';

	return (
		<EmptyStateCTA
			description={ __( 'Build a new site from scratch' ) }
			label={ __( 'Create a site' ) }
			target={ addQueryArgs( { source: 'sites-dashboard', ref: 'calypso-nosites' }, newSiteURL ) }
		/>
	);
};

export const MigrateSiteCTA = () => {
	const { __ } = useI18n();

	return (
		<EmptyStateCTA
			description={ __( 'Bring a site to WordPress.com' ) }
			label={ __( 'Migrate a site' ) }
			target="/start/import"
		/>
	);
};
