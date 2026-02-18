import { isInaccessibleJetpackError } from '@automattic/api-core';
import { useQueryClient } from '@tanstack/react-query';
import { ExternalLink } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import UnknownError from '../../app/500';
import { getSiteFromCache } from '../../app/analytics/super-props';
import { siteRoute } from '../../app/router/sites';
import { Notice } from '../../components/notice';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import RouterLinkButton from '../../components/router-link-button';
import { isCommerceGarden } from '../../utils/site-types';

export default function Error( { error }: { error: Error } ) {
	if ( isInaccessibleJetpackError( error ) ) {
		return <InaccessibleJetpackError error={ error } />;
	}
	return <UnknownError error={ error } />;
}

function InaccessibleJetpackError( { error }: { error: Error } ) {
	const { siteSlug } = siteRoute.useParams();
	const queryClient = useQueryClient();
	const site = getSiteFromCache( queryClient, siteSlug );
	const isCommerceGardenSite = site ? isCommerceGarden( site ) : false;

	// For commerce garden sites, remove "Jetpack" from the API error message
	const displayMessage = isCommerceGardenSite
		? error.message.replace( /^The Jetpack site /, 'The site ' )
		: error.message;

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
					title={
						isCommerceGardenSite
							? __( 'Your site can not be reached at this time.' )
							: __( 'Your Jetpack site can not be reached at this time.' )
					}
					actions={
						! isCommerceGardenSite && (
							<ExternalLink href="https://jetpack.com/support/getting-started-with-jetpack/fixing-jetpack-connection-issues/">
								{ __( 'Troubleshoot your Jetpack site' ) }
							</ExternalLink>
						)
					}
				>
					{ displayMessage }
				</Notice>
			}
		></PageLayout>
	);
}
