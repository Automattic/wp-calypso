import {
	activeAgencyQuery,
	agencyEnablementResourcesQuery,
	agencyResourceEventMutation,
} from '@automattic/api-queries';
import { useMutation, useQuery, useSuspenseQuery } from '@tanstack/react-query';
import { __ } from '@wordpress/i18n';
import { useCallback } from 'react';
import { useAnalytics } from '../../../app/analytics';
import { usePersistentView } from '../../../app/hooks/use-persistent-view';
import { learnRoute } from '../../../app/router/agency';
import { PageHeader } from '../../../components/page-header';
import PageLayout from '../../../components/page-layout';
import { DEFAULT_VIEW } from './dataviews/views';
import ResourceCenter, { getResourceCenterDescription } from './resource-center';
import type { AgencyEnablementResource } from '@automattic/api-core';

export default function Learn() {
	const { recordTracksEvent } = useAnalytics();
	const { data } = useSuspenseQuery( agencyEnablementResourcesQuery() );
	const searchParams = learnRoute.useSearch();
	const navigate = learnRoute.useNavigate();
	const { view, updateView } = usePersistentView( {
		slug: 'agency-library',
		defaultView: DEFAULT_VIEW,
		queryParams: searchParams,
	} );
	const { data: agency } = useQuery( activeAgencyQuery() );
	const agencyId = agency?.id;
	const { mutate: recordResourceEvent } = useMutation(
		agencyResourceEventMutation( agencyId ?? 0 )
	);

	const handleResourceClick = useCallback(
		( resource: AgencyEnablementResource ) => {
			if ( agencyId ) {
				recordResourceEvent( { resource_id: resource.id, resource_name: resource.name } );
			}
		},
		[ agencyId, recordResourceEvent ]
	);

	// Kept in the URL so a resource's details can be linked to. Replaced rather
	// than pushed, so Back leaves the page instead of stepping through resources.
	const setSelectedId = useCallback(
		( id: number | null ) =>
			navigate( {
				search: ( prev: Record< string, unknown > ) => ( { ...prev, resource: id ?? undefined } ),
				replace: true,
				resetScroll: false,
			} ),
		[ navigate ]
	);

	return (
		<PageLayout
			header={
				<PageHeader title={ __( 'Library' ) } description={ getResourceCenterDescription() } />
			}
		>
			<ResourceCenter
				resources={ data.results }
				view={ view }
				onChangeView={ updateView }
				recordTracksEvent={ recordTracksEvent }
				onResourceClick={ handleResourceClick }
				selectedId={ searchParams.resource ?? null }
				onSelectedIdChange={ setSelectedId }
			/>
		</PageLayout>
	);
}
