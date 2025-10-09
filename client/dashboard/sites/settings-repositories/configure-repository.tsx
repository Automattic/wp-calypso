import {
	siteBySlugQuery,
	githubInstallationsQuery,
	updateCodeDeploymentMutation,
	codeDeploymentQuery,
} from '@automattic/api-queries';
import { useSuspenseQuery, useMutation } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import {
	Card,
	CardBody,
	__experimentalVStack as VStack,
	ExternalLink,
} from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { siteRoute } from '../../app/router/sites';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import { SectionHeader } from '../../components/section-header';
import { ConnectRepositoryForm } from './connect-repository-form';

export default function ConfigureRepository() {
	const { siteSlug, deploymentId } = siteRoute.useParams();
	const { data: site } = useSuspenseQuery( siteBySlugQuery( siteSlug ) );
	const { data: existingDeployment } = useSuspenseQuery(
		codeDeploymentQuery( site.ID, deploymentId )
	);
	const { data: installations } = useSuspenseQuery( githubInstallationsQuery() );
	const navigateFrom = '/sites/$siteSlug/settings/repositories/manage/$deploymentId';
	const navigate = useNavigate( {
		from: navigateFrom,
	} );

	const handleCancel = () => {
		navigate( { to: '/sites/$siteSlug/settings/repositories' } );
	};

	const updateMutation = useMutation( updateCodeDeploymentMutation( site.ID, deploymentId ?? 0 ) );

	const selectedInstallation = installations.find(
		( inst ) => inst.external_id === existingDeployment.installation_id
	);

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
		<PageLayout
			size="small"
			header={
				<PageHeader
					title={ __( 'Configure Repository' ) }
					description={ __(
						'Update the GitHub repository connection to deploy code to your WordPress site.'
					) }
				/>
			}
		>
			<Card>
				<CardBody>
					<VStack spacing={ 6 }>
						<SectionHeader
							level={ 3 }
							title={ __( 'Update connection details' ) }
							description={ createInterpolateElement(
								__(
									'Update the connection used to deploy a GitHub repository to your WordPress.com site. Missing GitHub repositories? <a>Adjust permissions on GitHub</a>'
								),
								{
									a: (
										<ExternalLink
											href={ `https://github.com/settings/installations/${ selectedInstallation?.external_id }` }
										>
											{ __( 'Adjust permissions on GitHub' ) }
										</ExternalLink>
									),
								}
							) }
						/>
						<ConnectRepositoryForm
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
					</VStack>
				</CardBody>
			</Card>
		</PageLayout>
	);
}
