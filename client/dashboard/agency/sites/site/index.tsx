import { agencySiteQuery } from '@automattic/api-queries';
import { useSuspenseQuery } from '@tanstack/react-query';
import { Outlet } from '@tanstack/react-router';
import { __ } from '@wordpress/i18n';
import { agencySiteRoute } from '../../../app/router/agency';
import { PageHeader } from '../../../components/page-header';
import PageLayout from '../../../components/page-layout';

export default function AgencySite() {
	const { siteSlug } = agencySiteRoute.useParams();
	const { data: site } = useSuspenseQuery( agencySiteQuery( siteSlug ) );

	if ( ! site ) {
		return (
			<PageLayout
				header={
					<PageHeader
						title={ __( 'Site not found' ) }
						description={ __( 'This site is no longer managed by your agency.' ) }
					/>
				}
			/>
		);
	}

	return <Outlet />;
}
