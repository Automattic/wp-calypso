import { siteBySlugQuery } from '@automattic/api-queries';
import { useSuspenseQuery } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { Card, CardBody, __experimentalVStack as VStack } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { siteRoute } from '../../app/router/sites';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import { ConnectRepositoryForm } from './connect-repository-form';

export default function ConnectRepository() {
	const { siteSlug } = siteRoute.useParams();
	const { data: site } = useSuspenseQuery( siteBySlugQuery( siteSlug ) );
	const navigate = useNavigate( { from: '/sites/$siteSlug/settings/repositories/connect' } );

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
					title={ __( 'Connect Repository' ) }
					description={ __( 'Connect a GitHub repository to deploy code to your WordPress site.' ) }
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
						/>
					</VStack>
				</CardBody>
			</Card>
		</PageLayout>
	);
}
