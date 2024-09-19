import page from '@automattic/calypso-router';
import { Gridicon } from '@automattic/components';
import { DropdownMenu, MenuGroup, MenuItem } from '@wordpress/components';
import { Fragment } from '@wordpress/element';
import { Icon, linkOff } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import { useDispatch } from 'react-redux';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { manageDeploymentPage, viewDeploymentLogs } from '../routes';
import { CodeDeploymentData } from './use-code-deployments-query';

interface DeploymentsListItemActionsProps {
	siteSlug: string;
	onManualDeployment(): void;
	onDisconnectRepository(): void;
	deployment: CodeDeploymentData;
}

export const DeploymentsListItemActions = ( {
	siteSlug,
	onManualDeployment,
	onDisconnectRepository,
	deployment,
}: DeploymentsListItemActionsProps ) => {
	const dispatch = useDispatch();
	const { __ } = useI18n();

	return (
		<DropdownMenu icon={ <Gridicon icon="ellipsis" /> } label={ __( 'Deployment actions' ) }>
			{ ( { onClose } ) => (
				<Fragment>
					<MenuGroup>
						<MenuItem
							onClick={ () => {
								dispatch(
									recordTracksEvent( 'calypso_hosting_github_manual_deployment_run_click' )
								);
								onManualDeployment();
								onClose();
							} }
						>
							{ __( 'Trigger manual deployment' ) }
						</MenuItem>
						<MenuItem
							disabled={ ! deployment.current_deployment_run }
							onClick={ () => {
								dispatch( recordTracksEvent( 'calypso_hosting_github_see_deployment_runs_click' ) );
								page( viewDeploymentLogs( siteSlug, deployment.id ) );
								onClose();
							} }
						>
							{ __( 'See deployment runs' ) }
						</MenuItem>
						<MenuItem
							onClick={ () => {
								dispatch(
									recordTracksEvent( 'calypso_hosting_github_configure_connection_click' )
								);
								page( manageDeploymentPage( siteSlug, deployment.id ) );
								onClose();
							} }
						>
							{ __( 'Configure connection' ) }
						</MenuItem>
					</MenuGroup>
					<MenuGroup>
						<MenuItem
							className="github-deployments-list__menu-item-danger"
							onClick={ () => {
								dispatch(
									recordTracksEvent( 'calypso_hosting_github_disconnect_repository_click' )
								);
								onDisconnectRepository();
								onClose();
							} }
						>
							<Icon icon={ linkOff } />
							{ __( 'Disconnect repository' ) }
						</MenuItem>
					</MenuGroup>
				</Fragment>
			) }
		</DropdownMenu>
	);
};
