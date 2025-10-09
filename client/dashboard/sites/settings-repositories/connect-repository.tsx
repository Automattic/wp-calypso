import {
	siteBySlugQuery,
	githubInstallationsQuery,
	createCodeDeploymentMutation,
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
import Breadcrumbs from '../../app/breadcrumbs';
import {
	siteRoute,
	siteSettingsRepositoriesConnectRoute,
	siteSettingsRepositoriesRoute,
} from '../../app/router/sites';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import { SectionHeader } from '../../components/section-header';
import { ConnectRepositoryForm } from './connect-repository-form';
import type { ConnectRepositoryFormData } from './connect-repository-form';

export default function ConnectRepository() {
	const { siteSlug } = siteRoute.useParams();
	const { data: site } = useSuspenseQuery( siteBySlugQuery( siteSlug ) );
	const { data: installations } = useSuspenseQuery( githubInstallationsQuery() );
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
					description={ __( 'Connect a GitHub repository to deploy code to your WordPress site.' ) }
				/>
			}
		>
			<Card>
				<CardBody>
					<SectionHeader
						level={ 3 }
						title={ __( 'Configure repository connection' ) }
						description={ createInterpolateElement(
							__(
								'Configure a repository connection to deploy a GitHub repository to your WordPress.com site. Missing GitHub repositories? <a>Adjust permissions on GitHub</a>'
							),
							{
								a: (
									<ExternalLink
										href={ `https://github.com/settings/installations/${ installations[ 0 ]?.external_id }` }
									>
										{ __( 'Adjust permissions on GitHub' ) }
									</ExternalLink>
								),
							}
						) }
					/>
					<VStack spacing={ 6 }>
						<ConnectRepositoryForm
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
					</VStack>
				</CardBody>
			</Card>
		</PageLayout>
	);
}
