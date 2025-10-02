import { useNavigate } from '@tanstack/react-router';
import { Notice } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
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
import { useEditSchedules } from '../hooks/use-edit-schedules';
import { useLoadScheduleById } from '../hooks/use-load-schedule-by-id';

export default function PluginsScheduledUpdatesEdit() {
	const { scheduleId } = pluginsScheduledUpdatesEditRoute.useParams();
	const navigate = useNavigate( { from: pluginsScheduledUpdatesEditRoute.fullPath } );

	const { loading, error, initial } = useLoadScheduleById( scheduleId );
	const { mutateAsync: runEdit } = useEditSchedules(
		scheduleId,
		( initial?.siteIds || [] ).map( ( id ) => Number( id ) )
	);

	const handleSave: ScheduledUpdatesFormOnSubmit = async ( inputs ) => {
		await runEdit( {
			siteIds: inputs.siteIds.map( ( id ) => Number( id ) ),
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
			header={ <PageHeader /> }
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
				/>
			) }
		</PageLayout>
	);
}
