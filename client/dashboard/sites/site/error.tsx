import { Notice } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import UnknownError from '../../app/500';
import { siteRoute } from '../../app/router/sites';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import RouterLinkButton from '../../components/router-link-button';
import { DashboardDataError } from '../../data/error';

export default function Error( { error }: { error: Error } ) {
	switch ( error instanceof DashboardDataError && error.code ) {
		case 'inaccessible_jetpack':
			return <InaccessibleJetpackError error={ error } />;
		default:
			return <UnknownError error={ error } />;
	}
}

function InaccessibleJetpackError( { error }: { error: Error } ) {
	const { siteSlug } = siteRoute.useParams();

	return (
		<PageLayout
			header={
				<PageHeader
					title={ siteSlug }
					description={ __( 'Your Jetpack site can not be reached at this time.' ) }
					actions={
						<RouterLinkButton to="/sites" variant="primary" __next40pxDefaultSize>
							{ __( 'Go to Sites' ) }
						</RouterLinkButton>
					}
				/>
			}
			notices={
				<Notice status="error" isDismissible={ false }>
					{ error.message }
				</Notice>
			}
		></PageLayout>
	);
}
