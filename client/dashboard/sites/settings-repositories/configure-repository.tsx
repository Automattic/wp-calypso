import { siteBySlugQuery } from '@automattic/api-queries';
import { useSuspenseQuery } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { Card, CardBody, __experimentalVStack as VStack } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { siteRoute } from '../../app/router/sites';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import { ConnectRepositoryForm } from './connect-repository-form';

export default function ConfigureRepository() {
	const { siteSlug, deploymentId } = siteRoute.useParams();
	const { data: site } = useSuspenseQuery( siteBySlugQuery( siteSlug ) );

	const isEditing = Boolean( deploymentId );
	const fromPath = isEditing
		? '/sites/$siteSlug/settings/repositories/manage/$deploymentId'
		: '/sites/$siteSlug/settings/repositories/connect';
	const navigate = useNavigate( { from: fromPath } );

	const handleConnected = () => {
		navigate( { to: '/sites/$siteSlug/settings/repositories' } );
	};

	const handleCancel = () => {
		navigate( { to: '/sites/$siteSlug/settings/repositories' } );
	};

	return (
		<PageLayout
			size="small"
			header={
				<PageHeader
					title={ isEditing ? __( 'Configure Connection' ) : __( 'Connect Repository' ) }
					description={
						isEditing
							? __( 'Update the GitHub repository settings for your WordPress site.' )
							: __( 'Connect a GitHub repository to deploy code to your WordPress site.' )
					}
				/>
			}
		>
			<Card>
				<CardBody>
					<VStack spacing={ 6 }>
						<ConnectRepositoryForm
							site={ site }
							onConnected={ handleConnected }
							onCancel={ handleCancel }
							deploymentId={ deploymentId }
							isEditing={ isEditing }
						/>
					</VStack>
				</CardBody>
			</Card>
		</PageLayout>
	);
}
