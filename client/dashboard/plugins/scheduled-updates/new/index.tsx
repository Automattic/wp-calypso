import { useNavigate } from '@tanstack/react-router';
import { useDispatch } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import { useCallback, useMemo, useState } from 'react';
import Breadcrumbs from '../../../app/breadcrumbs';
import { PageHeader } from '../../../components/page-header';
import PageLayout from '../../../components/page-layout';
import { PLUGINS_SCHEDULED_UPDATES_PATH } from '../../paths';
import {
	ScheduledUpdatesForm,
	type ScheduledUpdatesFormOnSubmit,
} from '../components/schedule-form';
import { useCreateSchedules } from '../hooks/use-create-schedules';

function ScheduledUpdatesNew() {
	const navigate = useNavigate();
	const { createSuccessNotice } = useDispatch( noticesStore );
	const [ selectedSiteIds, setSelectedSiteIds ] = useState< string[] >( [] );
	const siteIdsAsNumbers = useMemo(
		() => selectedSiteIds.map( ( id ) => Number( id ) ),
		[ selectedSiteIds ]
	);
	const { mutateAsync: runCreate } = useCreateSchedules( siteIdsAsNumbers );

	const handleSave: ScheduledUpdatesFormOnSubmit = useCallback(
		async ( inputs ) => {
			await runCreate( inputs );
			createSuccessNotice( __( 'Schedule created successfully.' ), { type: 'snackbar' } );
			navigate( { to: PLUGINS_SCHEDULED_UPDATES_PATH } );
		},
		[ navigate, runCreate, createSuccessNotice ]
	);

	return (
		<PageLayout
			size="small"
			header={
				<PageHeader
					prefix={ <Breadcrumbs length={ 2 } /> }
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
