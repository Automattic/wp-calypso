import { activeAgencyQuery, agencyEnablementResourcesQuery } from '@automattic/api-queries';
import { useQuery, useSuspenseQuery } from '@tanstack/react-query';
import { __ } from '@wordpress/i18n';
import { useMemo } from 'react';
import { useAnalytics } from '../../../app/analytics';
import { PageHeader } from '../../../components/page-header';
import PageLayout from '../../../components/page-layout';
import { formatAgencyResources } from './format-resources';
import ResourceCenter from './resource-center';

export default function Learn() {
	const { recordTracksEvent } = useAnalytics();
	const { data } = useSuspenseQuery( agencyEnablementResourcesQuery() );
	const { data: agency } = useQuery( activeAgencyQuery() );
	const resources = useMemo( () => formatAgencyResources( data.results ), [ data ] );

	return (
		<PageLayout header={ <PageHeader title={ __( 'Library' ) } /> }>
			<ResourceCenter
				resources={ resources }
				recordTracksEvent={ recordTracksEvent }
				agencyId={ agency?.id }
			/>
		</PageLayout>
	);
}
