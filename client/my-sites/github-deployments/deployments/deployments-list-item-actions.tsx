import page from '@automattic/calypso-router';
import { Gridicon } from '@automattic/components';
import { DropdownMenu, MenuGroup, MenuItem } from '@wordpress/components';
import { Fragment } from '@wordpress/element';
import { Icon, linkOff } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
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
	const { __ } = useI18n();

	const canManualDeploy =
		! deployment.workflow_path || deployment.workflow_run_status === 'eligible';

	return (
		<DropdownMenu icon={ <Gridicon icon="ellipsis" /> } label={ __( 'Deployment actions' ) }>
			{ ( { onClose } ) => (
				<Fragment>
					<MenuGroup>
						<MenuItem
							disabled={ ! canManualDeploy }
							onClick={ () => {
								onManualDeployment();
								onClose();
							} }
						>
							{ __( 'Trigger manual deployment' ) }
						</MenuItem>
						<MenuItem
							disabled={ ! deployment.current_deployment_run }
							onClick={ () => {
								page( viewDeploymentLogs( siteSlug, deployment.id ) );
								onClose();
							} }
						>
							{ __( 'See deployment runs' ) }
						</MenuItem>
						<MenuItem
							onClick={ () => {
								page( manageDeploymentPage( siteSlug, deployment.id ) );
								onClose();
							} }
						>
							{ __( 'Configure repository' ) }
						</MenuItem>
					</MenuGroup>
					<MenuGroup>
						<MenuItem
							className="github-deployments-list__menu-item-danger"
							onClick={ () => {
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
