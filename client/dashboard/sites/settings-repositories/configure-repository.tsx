import {
	siteBySlugQuery,
	updateCodeDeploymentMutation,
	codeDeploymentQuery,
} from '@automattic/api-queries';
import { useSuspenseQuery, useMutation } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { __ } from '@wordpress/i18n';
import Breadcrumbs from '../../app/breadcrumbs';
import {
	siteRoute,
	siteSettingsRepositoriesRoute,
	siteSettingsRepositoriesManageRoute,
} from '../../app/router/sites';
import { Card, CardBody } from '../../components/card';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import { BackToDeploymentsButton } from './back-to-deployments-button';
import { ConnectRepositoryForm } from './connect-repository-form';

export default function ConfigureRepository() {
	const { siteSlug, deploymentId } = siteRoute.useParams();
	const { data: site } = useSuspenseQuery( siteBySlugQuery( siteSlug ) );
	const { data: existingDeployment } = useSuspenseQuery(
		codeDeploymentQuery( site.ID, deploymentId )
	);
	const navigateFrom = siteSettingsRepositoriesManageRoute.fullPath;
	const navigate = useNavigate( {
		from: navigateFrom,
	} );
	const search = siteSettingsRepositoriesManageRoute.useSearch();
	const showBackToDeployments = search?.from === 'deployments';

	const handleCancel = () => {
		navigate( { to: siteSettingsRepositoriesRoute.fullPath } );
	};

	const updateMutation = useMutation( updateCodeDeploymentMutation( site.ID, deploymentId ?? 0 ) );

	const initialValues = {
		selectedInstallationId: existingDeployment.installation_id,
		selectedRepositoryId: existingDeployment.external_repository_id,
		branch: existingDeployment.branch_name,
		targetDir: existingDeployment.target_dir,
		isAutomated: existingDeployment.is_automated,
		deploymentMode: existingDeployment.workflow_path
			? ( 'advanced' as const )
			: ( 'simple' as const ),
		workflowPath: existingDeployment.workflow_path ?? '',
	};

	return (
		<>
			<PageLayout
				size="small"
				header={
					<PageHeader
						prefix={ <Breadcrumbs length={ 3 } /> }
						title={ __( 'Configure Repository' ) }
						description={ __(
							'Update the GitHub repository connection to deploy code to your WordPress site.'
						) }
					/>
				}
			>
				<Card>
					<CardBody>
						<ConnectRepositoryForm
							formTitle={ __( 'Update connection details' ) }
							formDescription={ __(
								'Configure a repository connection to deploy a GitHub repository to your WordPress.com site.'
							) }
							onCancel={ handleCancel }
							mutation={ updateMutation }
							initialValues={ initialValues }
							submitText={ __( 'Update Connection' ) }
							successMessage={ __( 'Repository settings updated successfully.' ) }
							errorMessage={
								// translators: "reason" is why updating the repository failed.
								__( 'Failed to update repository: %(reason)s' )
							}
							navigateFrom={ navigateFrom }
						/>
					</CardBody>
				</Card>
			</PageLayout>
			{ showBackToDeployments && <BackToDeploymentsButton /> }
		</>
	);
}
