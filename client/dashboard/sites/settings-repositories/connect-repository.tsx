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
import { useDispatch } from '@wordpress/data';
import { createInterpolateElement } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import Breadcrumbs from '../../app/breadcrumbs';
import { siteRoute, siteSettingsRepositoriesRoute } from '../../app/router/sites';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import { SectionHeader } from '../../components/section-header';
import { ConnectRepositoryForm } from './connect-repository-form';
import type { ConnectRepositoryFormData } from './connect-repository-form';

export default function ConnectRepository() {
	const { siteSlug } = siteRoute.useParams();
	const { data: site } = useSuspenseQuery( siteBySlugQuery( siteSlug ) );
	const { data: installations } = useSuspenseQuery( githubInstallationsQuery() );
	const { createSuccessNotice, createErrorNotice } = useDispatch( noticesStore );
	const navigate = useNavigate( { from: siteSettingsRepositoriesRoute.fullPath } );

	const handleCancel = () => {
		navigate( { to: siteSettingsRepositoriesRoute.fullPath } );
	};

	const createMutation = useMutation( {
		...createCodeDeploymentMutation( site.ID ),
		onSuccess: async () => {
			createSuccessNotice( __( 'Repository connected successfully.' ), {
				type: 'snackbar',
			} );
			navigate( { to: siteSettingsRepositoriesRoute.fullPath } );
		},
		onError: ( error ) => {
			createErrorNotice(
				// translators: "reason" is why connecting the repository failed.
				sprintf( __( 'Failed to connect repository: %(reason)s' ), { reason: error.message } ),
				{
					type: 'snackbar',
				}
			);
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
						/>
					</VStack>
				</CardBody>
			</Card>
		</PageLayout>
	);
}
