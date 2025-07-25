import { useQueryClient } from '@tanstack/react-query';
import { Notice } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import UnknownError from '../../app/500';
import { siteBySlugQuery } from '../../app/queries/site';
import { sitesQuery } from '../../app/queries/sites';
import { siteRoute } from '../../app/router';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import RouterLinkButton from '../../components/router-link-button';
import { DashboardDataError } from '../../data/error';
import { getSiteDisplayName } from '../../utils/site-name';
import type { Site } from '../../data/types';

export default function Error( { error }: { error: Error } ) {
	switch ( error instanceof DashboardDataError && error.code ) {
		case 'inaccessible_jetpack':
			return <InaccessibleJetpackError error={ error } />;
		default:
			return <UnknownError error={ error } />;
	}
}

function InaccessibleJetpackError( { error }: { error: Error } ) {
	const { siteSlug } = siteRoute.useParams();
	const queryClient = useQueryClient();

	let site = queryClient.getQueryData< Site >( siteBySlugQuery( siteSlug ).queryKey );
	if ( ! site ) {
		const allSites = queryClient.getQueryData< Site[] >( sitesQuery().queryKey );
		site = allSites?.find( ( s ) => s.slug === siteSlug );
	}

	return (
		<PageLayout
			header={
				<PageHeader
					title={ site ? getSiteDisplayName( site ) : siteSlug }
					description={ __( 'Your Jetpack site can not be reached at this time.' ) }
					actions={
						<RouterLinkButton to="/sites" variant="primary" __next40pxDefaultSize>
							{ __( 'Go to Sites' ) }
						</RouterLinkButton>
					}
				/>
			}
			notices={
				<Notice status="error" isDismissible={ false }>
					{ error.message }
				</Notice>
			}
		></PageLayout>
	);
}
