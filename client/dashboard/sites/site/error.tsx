import { isInaccessibleJetpackError } from '@automattic/api-core';
import { siteBySlugQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { __ } from '@wordpress/i18n';
import UnknownError from '../../app/500';
import { siteRoute } from '../../app/router/sites';
import Notice, { NoticeActionLink, RouterNoticeActionLink } from '../../components/notice';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import RouterLinkButton from '../../components/router-link-button';
import { SitePermissionError } from '../../utils/site-permissions';
import { isP2 } from '../../utils/site-types';
import { toError } from '../../utils/to-error';
import { InaccessibleJetpackNotice } from './notices';
import type { Site } from '@automattic/api-core';

export default function Error( { error: thrown }: { error: unknown } ) {
	const error = toError( thrown );
	if ( isInaccessibleJetpackError( error ) ) {
		return <InaccessibleJetpackError error={ error } />;
	}
	if ( error instanceof SitePermissionError ) {
		return <SitePermissionErrorPage />;
	}
	return <UnknownError error={ error } />;
}

function getSitePermissionMessage( site: Site | undefined ) {
	if ( site && isP2( site ) ) {
		return {
			title: __( 'P2s can’t be managed here' ),
			message: __( 'Manage this P2 from its WP Admin instead.' ),
		};
	}

	if ( site?.is_vip ) {
		return {
			title: __( 'VIP sites can’t be managed here' ),
			message: __( 'Manage this site from its WP Admin instead.' ),
		};
	}

	return {
		title: __( 'Administrators only' ),
		message: __(
			'You need to be an administrator of this site to manage it. Ask one of the site’s administrators for help.'
		),
	};
}

function SitePermissionErrorPage() {
	const { siteSlug } = siteRoute.useParams();
	const { data: site } = useQuery( siteBySlugQuery( siteSlug ) );
	const { title, message } = getSitePermissionMessage( site );
	const adminUrl = site?.capabilities?.manage_options ? site.options?.admin_url : undefined;

	return (
		<PageLayout
			header={ <PageHeader title={ siteSlug } /> }
			notices={
				<Notice
					variant="warning"
					title={ title }
					actions={
						<>
							{ adminUrl && (
								<NoticeActionLink href={ adminUrl }>{ __( 'Go to WP Admin' ) }</NoticeActionLink>
							) }
							<RouterNoticeActionLink to="/sites">{ __( 'Go to Sites' ) }</RouterNoticeActionLink>
						</>
					}
				>
					{ message }
				</Notice>
			}
		/>
	);
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
			notices={ <InaccessibleJetpackNotice error={ error } /> }
		></PageLayout>
	);
}
