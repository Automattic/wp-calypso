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
	type InitialValues,
} from '../components/schedule-form';

/**
 *
 * Placeholder hook.
 */
function useLoadScheduleById( _scheduleId: string ) {
	// Placeholder state and derived values until hook is implemented in next task
	void _scheduleId;
	return {
		loading: false,
		error: '',
		initial: null as unknown as InitialValues,
	} as const;
}

export default function PluginsScheduledUpdatesEdit() {
	const { scheduleId } = pluginsScheduledUpdatesEditRoute.useParams();
	const navigate = useNavigate( { from: pluginsScheduledUpdatesEditRoute.fullPath } );

	const { loading, error, initial } = useLoadScheduleById( scheduleId );

	const handleSave: ScheduledUpdatesFormOnSubmit = async ( inputs ) => {
		void inputs;
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
				/>
			) }
		</PageLayout>
	);
}
