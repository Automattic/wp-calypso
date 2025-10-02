import { siteBySlugQuery } from '@automattic/api-queries';
import { useSuspenseQuery } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { Card, CardBody, __experimentalVStack as VStack } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { siteRoute } from '../../app/router/sites';
import PageLayout from '../../components/page-layout';
import SettingsPageHeader from '../settings-page-header';
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

	const breadcrumbs = [
		{
			label: __( 'Settings' ),
			path: `/sites/${ siteSlug }/settings`,
		},
		{
			label: __( 'Repositories' ),
			path: `/sites/${ siteSlug }/settings/repositories`,
		},
		{
			label: __( 'Connect' ),
			path: `/sites/${ siteSlug }/settings/repositories/connect`,
		},
	];

	return (
		<PageLayout
			size="small"
			header={
				<SettingsPageHeader
					title={ __( 'Connect Repository' ) }
					description={ __( 'Connect a GitHub repository to deploy code to your WordPress site.' ) }
					breadcrumbs={ breadcrumbs }
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
