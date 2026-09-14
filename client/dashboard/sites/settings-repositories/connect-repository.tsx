import {
	siteBySlugQuery,
	githubInstallationsQuery,
	createCodeDeploymentMutation,
} from '@automattic/api-queries';
import { useSuspenseQuery, useQuery, useMutation } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { __, sprintf } from '@wordpress/i18n';
import { useAnalytics } from '../../app/analytics';
import Breadcrumbs from '../../app/breadcrumbs';
import {
	siteRoute,
	siteSettingsRepositoriesConnectRoute,
	siteSettingsRepositoriesRoute,
} from '../../app/router/sites';
import { Card, CardBody } from '../../components/card';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import { ConnectRepositoryForm } from './connect-repository-form';
import { getDeploymentErrorReason, getDeploymentTypeFromPath } from './deployment-tracks';
import type { ConnectRepositoryFormData } from './connect-repository-form';

export default function ConnectRepository() {
	const { siteSlug } = siteRoute.useParams();
	const { data: site } = useSuspenseQuery( siteBySlugQuery( siteSlug ) );
	const { data: installations = [] } = useQuery( githubInstallationsQuery() );
	const navigateFrom = siteSettingsRepositoriesConnectRoute.fullPath;
	const navigate = useNavigate( { from: navigateFrom } );
	const { recordTracksEvent } = useAnalytics();

	const handleCancel = () => {
		navigate( { to: siteSettingsRepositoriesRoute.fullPath } );
	};

	const createMutationOptions = createCodeDeploymentMutation( site.ID );
	const createMutation = useMutation( {
		...createMutationOptions,
		onSuccess: ( data, variables, context ) => {
			createMutationOptions.onSuccess?.( data, variables, context );
			recordTracksEvent( 'calypso_hosting_github_create_deployment_success', {
				deployment_type: getDeploymentTypeFromPath( data.target_dir ),
				is_automated: data.is_automated,
				workflow_path: data.workflow_path,
			} );
		},
		onError: ( error, variables, context ) => {
			createMutationOptions.onError?.( error, variables, context );
			recordTracksEvent( 'calypso_hosting_github_create_deployment_failure', {
				reason: getDeploymentErrorReason( error ),
			} );
		},
	} );

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
					description={ __( 'Deploy code from GitHub to your WordPress.com site.' ) }
				/>
			}
		>
			<Card>
				<CardBody>
					<ConnectRepositoryForm
						formTitle={ __( 'Set up connection' ) }
						formDescription={ __(
							'Choose your GitHub account and repository to connect with WordPress.com.'
						) }
						onCancel={ handleCancel }
						mutation={ createMutation }
						initialValues={ initialValues }
						submitText={ __( 'Connect Repository' ) }
						successMessage={ __( 'Repository connected successfully.' ) }
						errorMessage={ ( reason ) =>
							sprintf(
								// translators: %(reason)s: why connecting the repository failed.
								__( 'Failed to connect repository: %(reason)s' ),
								{ reason }
							)
						}
						navigateFrom={ navigateFrom }
					/>
				</CardBody>
			</Card>
		</PageLayout>
	);
}
