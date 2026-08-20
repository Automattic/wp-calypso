import { useNavigate, useParams } from '@tanstack/react-router';
import { Notice } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useEffect, useState } from 'react';
import Breadcrumbs from '../../../app/breadcrumbs';
import { PageHeader } from '../../../components/page-header';
import PageLayout from '../../../components/page-layout';
import { PLUGINS_SCHEDULED_UPDATES_PATH } from '../../paths';
import {
	ScheduledUpdatesForm,
	type ScheduledUpdatesFormOnSubmit,
} from '../components/schedule-form';
import { useLoadScheduleById } from '../hooks/use-load-schedule-by-id';
import { useReconcileSchedules } from '../hooks/use-reconcile-schedules';

export default function PluginsScheduledUpdatesEdit() {
	const { scheduleId = '' } = useParams( { strict: false } );
	const navigate = useNavigate();

	const { loading, error, initial } = useLoadScheduleById( scheduleId );
	const [ selectedSiteIds, setSelectedSiteIds ] = useState< string[] >( [] );

	useEffect( () => {
		if ( initial?.siteIds ) {
			setSelectedSiteIds( initial.siteIds );
		}
	}, [ initial?.siteIds ] );

	const { mutateAsync: runReconcile } = useReconcileSchedules(
		scheduleId,
		initial?.siteIds || [],
		selectedSiteIds
	);

	const handleSave: ScheduledUpdatesFormOnSubmit = async ( inputs ) => {
		await runReconcile( {
			plugins: inputs.plugins,
			frequency: inputs.frequency,
			weekday: inputs.weekday,
			time: inputs.time,
		} );
		navigate( { to: PLUGINS_SCHEDULED_UPDATES_PATH } );
	};

	return (
		<PageLayout
			size="small"
			header={
				<PageHeader
					prefix={ <Breadcrumbs length={ 2 } /> }
					description={ __( 'Edit your scheduled plugin update configuration.' ) }
				/>
			}
			notices={
				error && (
					<Notice status="error" isDismissible={ false }>
						{ error }
					</Notice>
				)
			}
		>
			{ ! loading && ! error && (
				<ScheduledUpdatesForm
					submitLabel={ __( 'Save changes' ) }
					onSubmit={ handleSave }
					initial={ initial }
					editedSchedule={ {
						siteIds: ( initial?.siteIds || [] ).map( ( id ) => Number( id ) ),
						scheduleId,
					} }
					onSitesChange={ setSelectedSiteIds }
				/>
			) }
		</PageLayout>
	);
}
