import {
	activeAgencyQuery,
	agencyEnablementResourcesQuery,
	userPreferenceOptimisticMutation,
	userPreferenceQuery,
} from '@automattic/api-queries';
import { useMutation, useQuery, useSuspenseQuery } from '@tanstack/react-query';
import { __ } from '@wordpress/i18n';
import { useCallback } from 'react';
import { useAnalytics } from '../../../app/analytics';
import { usePersistentView } from '../../../app/hooks/use-persistent-view';
import { learnRoute } from '../../../app/router/agency';
import { withSnackbar } from '../../../app/snackbars/with-snackbar';
import { PageHeader } from '../../../components/page-header';
import PageLayout from '../../../components/page-layout';
import { DEFAULT_VIEW } from './dataviews/views';
import { NO_READ_IDS, READ_RESOURCES_PREFERENCE } from './lib/read-resources';
import ResourceCenter, { getResourceCenterDescription } from './resource-center';

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
	const { data: readIds = NO_READ_IDS } = useQuery(
		userPreferenceQuery( READ_RESOURCES_PREFERENCE )
	);
	const { mutate: saveReadIds } = useMutation(
		withSnackbar( userPreferenceOptimisticMutation( READ_RESOURCES_PREFERENCE ), {
			error: __( 'Failed to save reading status.' ),
		} )
	);

	// Kept in the URL so a resource's details can be linked to. Opening pushes,
	// so Back closes the modal; moving between resources and closing replace.
	const isOpen = searchParams.resource !== undefined;
	const setSelectedId = useCallback(
		( id: number | null ) =>
			navigate( {
				search: ( prev: Record< string, unknown > ) => ( { ...prev, resource: id ?? undefined } ),
				replace: isOpen,
				resetScroll: false,
			} ),
		[ navigate, isOpen ]
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
				agencyId={ agency?.id }
				readIds={ readIds }
				onReadIdsChange={ saveReadIds }
				selectedId={ searchParams.resource ?? null }
				onSelectedIdChange={ setSelectedId }
			/>
		</PageLayout>
	);
}
