import {
	activeAgencyQuery,
	agencyResourceEventMutation,
	agencyResourcesQuery,
} from '@automattic/api-queries';
import { useMutation, useQuery, useSuspenseQuery } from '@tanstack/react-query';
import { __ } from '@wordpress/i18n';
import { useAnalytics } from '../../../app/analytics';
import { PageHeader } from '../../../components/page-header';
import PageLayout from '../../../components/page-layout';
import ResourceCenter from './resource-center';
import type { ResourceItem } from './types';

export default function Learn() {
	const { recordTracksEvent } = useAnalytics();
	const { data } = useSuspenseQuery( agencyResourcesQuery() );
	const { data: agency } = useQuery( activeAgencyQuery() );
	const { mutate: recordResourceEvent } = useMutation(
		agencyResourceEventMutation( agency?.id ?? 0 )
	);

	const handleResourceClick = ( resource: ResourceItem ) => {
		if ( agency?.id ) {
			recordResourceEvent( resource );
		}
	};

	return (
		<PageLayout header={ <PageHeader title={ __( 'Library' ) } /> }>
			<ResourceCenter
				data={ data }
				recordTracksEvent={ recordTracksEvent }
				onResourceClick={ handleResourceClick }
			/>
		</PageLayout>
	);
}
