import { useI18n } from '@wordpress/react-i18n';
import { addQueryArgs } from '@wordpress/url';
import { useSelector } from 'react-redux';
import getCurrentQueryArguments from 'calypso/state/selectors/get-current-query-arguments';
import { useSitesDashboardCreateSiteUrl } from '../hooks/use-sites-dashboard-create-site-url';
import { TRACK_SOURCE_NAME } from '../utils';
import { EmptyStateCTA } from './empty-state-cta';

export const CreateSiteCTA = () => {
	const { __ } = useI18n();

	const isHostingFlow = useSelector(
		( state ) => getCurrentQueryArguments( state )?.[ 'hosting-flow' ] === 'true'
	);

	const createSiteUrl = useSitesDashboardCreateSiteUrl( {
		'hosting-flow': isHostingFlow ? true : null,
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

	return (
		<EmptyStateCTA
			description={ __( 'Bring a site to WordPress.com' ) }
			label={ __( 'Migrate a site' ) }
			target={ addQueryArgs( '/start/import', {
				source: TRACK_SOURCE_NAME,
				ref: 'calypso-nosites',
			} ) }
		/>
	);
};
