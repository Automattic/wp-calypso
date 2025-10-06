import { useNavigate } from '@tanstack/react-router';
import { __ } from '@wordpress/i18n';
import { useCallback, useMemo, useState } from 'react';
import {
	pluginsScheduledUpdatesNewRoute,
	pluginsScheduledUpdatesRoute,
} from '../../../app/router/plugins';
import { PageHeader } from '../../../components/page-header';
import PageLayout from '../../../components/page-layout';
import {
	ScheduledUpdatesForm,
	type ScheduledUpdatesFormOnSubmit,
} from '../components/schedule-form';
import { useCreateSchedules } from '../hooks/use-create-schedules';

function ScheduledUpdatesNew() {
	const navigate = useNavigate( { from: pluginsScheduledUpdatesNewRoute.fullPath } );
	const [ selectedSiteIds, setSelectedSiteIds ] = useState< string[] >( [] );
	const siteIdsAsNumbers = useMemo(
		() => selectedSiteIds.map( ( id ) => Number( id ) ),
		[ selectedSiteIds ]
	);
	const { mutateAsync: runCreate } = useCreateSchedules( siteIdsAsNumbers );

	const handleSave: ScheduledUpdatesFormOnSubmit = useCallback(
		async ( inputs ) => {
			await runCreate( inputs );
			navigate( { to: pluginsScheduledUpdatesRoute.to } );
		},
		[ navigate, runCreate ]
	);

	return (
		<PageLayout
			size="small"
			header={
				<PageHeader
					title={ __( 'New schedule' ) }
					description={ __(
						'First, choose the sites you want. Next, select the plugins to update. Finally, set how often the updates should run.'
					) }
				/>
			}
		>
			<ScheduledUpdatesForm
				submitLabel={ __( 'Create schedule' ) }
				onSubmit={ handleSave }
				onSitesChange={ setSelectedSiteIds }
			/>
		</PageLayout>
	);
}

export default ScheduledUpdatesNew;
