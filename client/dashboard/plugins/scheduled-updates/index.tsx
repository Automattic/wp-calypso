import { useNavigate } from '@tanstack/react-router';
import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import {
	pluginsScheduledUpdatesNewRoute,
	pluginsScheduledUpdatesRoute,
} from '../../app/router/plugins';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';

export default function PluginsScheduledUpdates() {
	const navigate = useNavigate( { from: pluginsScheduledUpdatesRoute.fullPath } );

	return (
		<PageLayout
			size="small"
			header={
				<PageHeader
					title={ __( 'Scheduled updates' ) }
					actions={
						<Button
							variant="primary"
							onClick={ () => navigate( { to: pluginsScheduledUpdatesNewRoute.to } ) }
							__next40pxDefaultSize
						>
							{ __( 'New schedule' ) }
						</Button>
					}
				/>
			}
		>
			{ /* TODO: Implement schedule updates list UI */ }
		</PageLayout>
	);
}
