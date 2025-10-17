import { useNavigate } from '@tanstack/react-router';
import { Notice } from '@wordpress/components';
import { useEffect, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import Breadcrumbs from '../../../app/breadcrumbs';
import {
	pluginsScheduledUpdatesEditRoute,
	pluginsScheduledUpdatesRoute,
} from '../../../app/router/plugins';
import { PageHeader } from '../../../components/page-header';
import PageLayout from '../../../components/page-layout';
import {
	ScheduledUpdatesForm,
	type ScheduledUpdatesFormOnSubmit,
} from '../components/schedule-form';
import { useLoadScheduleById } from '../hooks/use-load-schedule-by-id';
import { useReconcileSchedules } from '../hooks/use-reconcile-schedules';

export default function PluginsScheduledUpdatesEdit() {
	const { scheduleId } = pluginsScheduledUpdatesEditRoute.useParams();
	const navigate = useNavigate( { from: pluginsScheduledUpdatesEditRoute.fullPath } );

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
		navigate( { to: pluginsScheduledUpdatesRoute.to } );
	};

	return (
		<PageLayout
			size="small"
			header={ <PageHeader prefix={ <Breadcrumbs length={ 2 } /> } /> }
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
