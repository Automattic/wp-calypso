import { isInaccessibleJetpackError } from '@automattic/api-core';
import { ExternalLink } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import UnknownError from '../../app/500';
import { siteRoute } from '../../app/router/sites';
import { Notice } from '../../components/notice';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import RouterLinkButton from '../../components/router-link-button';

export default function Error( { error }: { error: Error } ) {
	if ( isInaccessibleJetpackError( error ) ) {
		return <InaccessibleJetpackError error={ error } />;
	}
	return <UnknownError error={ error } />;
}

function InaccessibleJetpackError( { error }: { error: Error } ) {
	const { siteSlug } = siteRoute.useParams();

	return (
		<PageLayout
			header={
				<PageHeader
					title={ siteSlug }
					actions={
						<RouterLinkButton to="/sites" variant="primary" __next40pxDefaultSize>
							{ __( 'Go to Sites' ) }
						</RouterLinkButton>
					}
				/>
			}
			notices={
				<Notice
					variant="error"
					title={ __( 'Your Jetpack site can not be reached at this time.' ) }
					actions={
						<ExternalLink href="https://jetpack.com/support/getting-started-with-jetpack/fixing-jetpack-connection-issues/">
							{ __( 'Troubleshoot your Jetpack site' ) }
						</ExternalLink>
					}
				>
					{ error.message }
				</Notice>
			}
		></PageLayout>
	);
}
