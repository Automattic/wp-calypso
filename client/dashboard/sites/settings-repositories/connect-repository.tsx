import {
	siteBySlugQuery,
	githubInstallationsQuery,
	createCodeDeploymentMutation,
} from '@automattic/api-queries';
import { useSuspenseQuery, useQuery, useMutation } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { Card, CardBody, Button } from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import Breadcrumbs from '../../app/breadcrumbs';
import {
	siteRoute,
	siteSettingsRepositoriesConnectRoute,
	siteSettingsRepositoriesRoute,
} from '../../app/router/sites';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import { ConnectRepositoryForm } from './connect-repository-form';
import type { ConnectRepositoryFormData } from './connect-repository-form';

export default function ConnectRepository() {
	const { siteSlug } = siteRoute.useParams();
	const { data: site } = useSuspenseQuery( siteBySlugQuery( siteSlug ) );
	const { data: installations = [] } = useQuery( githubInstallationsQuery() );
	const navigateFrom = siteSettingsRepositoriesConnectRoute.fullPath;
	const navigate = useNavigate( { from: navigateFrom } );

	const handleCancel = () => {
		navigate( { to: siteSettingsRepositoriesRoute.fullPath } );
	};

	const createMutation = useMutation( createCodeDeploymentMutation( site.ID ) );

	const initialValues: ConnectRepositoryFormData = {
		selectedInstallationId: installations[ 0 ]?.external_id || '',
		selectedRepositoryId: '',
		branch: '',
		targetDir: '/',
		isAutomated: false,
		deploymentMode: 'simple',
		workflowPath: '',
	};

	return (
		<PageLayout
			size="small"
			header={
				<PageHeader
					prefix={ <Breadcrumbs length={ 3 } /> }
					title={ __( 'Connect Repository' ) }
					description={ __( 'Deploy code from GitHub to your WordPress site.' ) }
				/>
			}
		>
			<Card>
				<CardBody>
					<ConnectRepositoryForm
						formTitle={ __( 'Set up connection' ) }
						formDescription={ createInterpolateElement(
							__(
								'Choose your GitHub account and repository to connect with WordPress.com. Missing GitHub repositories? <a>Adjust permissions on GitHub</a>'
							),
							{
								a: (
									<Button
										variant="link"
										target="_blank"
										href={ `https://github.com/settings/installations/${ installations[ 0 ]?.external_id }` }
									/>
								),
							}
						) }
						onCancel={ handleCancel }
						mutation={ createMutation }
						initialValues={ initialValues }
						submitText={ __( 'Connect Repository' ) }
						successMessage={ __( 'Repository connected successfully.' ) }
						errorMessage={
							// translators: "reason" is why connecting the repository failed.
							__( 'Failed to connect repository: %(reason)s' )
						}
						navigateFrom={ navigateFrom }
					/>
				</CardBody>
			</Card>
		</PageLayout>
	);
}
