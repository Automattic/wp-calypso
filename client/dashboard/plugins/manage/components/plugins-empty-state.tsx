import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { Icon, plugins, wordpress } from '@wordpress/icons';
import { addQueryArgs } from '@wordpress/url';
import { useAnalytics } from '../../../app/analytics';
import { DataViewsEmptyStateLayout } from '../../../components/dataviews';
import EmptyState from '../../../components/empty-state';
import { wpcomLink } from '../../../utils/link';
import type { PluginsEmptyReason } from '../hooks/use-plugins-empty-reason';

const CONTEXT = 'dashboard-plugins';
const EMPTY_STATE_REF = 'dashboard-plugins-empty-state';

function useTrackEmptyStateActionClick() {
	const { recordTracksEvent } = useAnalytics();

	return ( action: string ) =>
		recordTracksEvent( 'calypso_dashboard_plugins_empty_state_action_click', { action } );
}

function NoSitesEmptyState() {
	const trackActionClick = useTrackEmptyStateActionClick();

	return (
		<DataViewsEmptyStateLayout
			title={ __( 'You need a site to install a plugin' ) }
			description={ __( 'Create a site to start installing plugins.' ) }
		>
			<EmptyState.ActionList>
				<EmptyState.ActionItem
					title={ __( 'Build a new site' ) }
					description={ __(
						'Pick a domain and plan, then build it yourself or with the WordPress Agent.'
					) }
					decoration={ <Icon icon={ wordpress } size={ 24 } /> }
					actions={
						<Button
							variant="secondary"
							href={ addQueryArgs( wpcomLink( '/start' ), {
								source: CONTEXT,
								ref: EMPTY_STATE_REF,
							} ) }
							onClick={ () => trackActionClick( 'create-site' ) }
							size="compact"
							__next40pxDefaultSize
						>
							{ __( 'Start now' ) }
						</Button>
					}
				/>
			</EmptyState.ActionList>
		</DataViewsEmptyStateLayout>
	);
}

function NoPluginsEmptyState() {
	const trackActionClick = useTrackEmptyStateActionClick();

	return (
		<DataViewsEmptyStateLayout
			title={ __( 'No plugins installed yet' ) }
			description={ __( 'Plugins on sites you can manage will appear here.' ) }
		>
			<EmptyState.ActionList>
				<EmptyState.ActionItem
					title={ __( 'Find a plugin' ) }
					description={ __( 'Add new features to your sites with free and premium plugins.' ) }
					decoration={ <Icon icon={ plugins } size={ 24 } /> }
					actions={
						<Button
							variant="secondary"
							href={ wpcomLink( '/plugins' ) }
							onClick={ () => trackActionClick( 'browse-plugins' ) }
							size="compact"
							__next40pxDefaultSize
						>
							{ __( 'Browse plugins' ) }
						</Button>
					}
				/>
			</EmptyState.ActionList>
		</DataViewsEmptyStateLayout>
	);
}

export function PluginsEmptyState( { reason }: { reason: PluginsEmptyReason } ) {
	return reason === 'no-sites' ? <NoSitesEmptyState /> : <NoPluginsEmptyState />;
}
