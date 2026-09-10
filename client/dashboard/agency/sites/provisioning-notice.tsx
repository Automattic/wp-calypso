import { activeAgencyQuery, provisionedAgencySitesQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { Button, ExternalLink } from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import Notice from '../../components/notice';
import { untrackProvisioningSite, useProvisioningSiteIds } from './provisioning-sites';
import type { ProvisionedAgencySite } from '@automattic/api-core';

const POLL_INTERVAL_MS = 5000;

function isReady( site: ProvisionedAgencySite ): boolean {
	return site.features?.wpcom_atomic?.state === 'active';
}

function siteUrlWithScheme( url: string ): string {
	return url.startsWith( 'http' ) ? url : `https://${ url }`;
}

function ReadyNotice( { site }: { site: ProvisionedAgencySite } ) {
	return (
		<Notice
			variant="success"
			title={ __( 'Your WordPress.com site is ready!' ) }
			onClose={ () => untrackProvisioningSite( site.id ) }
			actions={
				<Button
					variant="primary"
					href={ siteUrlWithScheme( site.url ) }
					target="_blank"
					rel="noreferrer"
				>
					{ __( 'Set up your site' ) }
				</Button>
			}
		>
			{ createInterpolateElement(
				__( '<address /> is now ready. It may take a few minutes to appear in the list below.' ),
				{
					address: <ExternalLink href={ siteUrlWithScheme( site.url ) }>{ site.url }</ExternalLink>,
				}
			) }
		</Notice>
	);
}

/**
 * Reports on sites this browser started creating: one notice each, from the
 * redirect that follows provisioning until the site answers as ready.
 *
 * Action feedback rather than an on-load banner, so it renders beside any other
 * notice the page shows rather than competing with it.
 */
export default function ProvisioningSiteNotices() {
	const provisioningSiteIds = useProvisioningSiteIds();
	const { data: agency } = useQuery( {
		...activeAgencyQuery(),
		enabled: provisioningSiteIds.length > 0,
	} );

	const { data: sites } = useQuery( {
		...provisionedAgencySitesQuery( agency?.id ?? 0 ),
		enabled: !! agency?.id && provisioningSiteIds.length > 0,
		refetchInterval: ( { state } ) => {
			const readyIds = ( state.data ?? [] ).filter( isReady ).map( ( { id } ) => id );
			const isWaiting = provisioningSiteIds.some( ( id ) => ! readyIds.includes( id ) );
			return isWaiting ? POLL_INTERVAL_MS : false;
		},
	} );

	if ( ! provisioningSiteIds.length ) {
		return null;
	}

	const readySites = new Map(
		( sites ?? [] ).filter( isReady ).map( ( site ) => [ site.id, site ] )
	);

	return (
		<>
			{ provisioningSiteIds.map( ( id ) => {
				const site = readySites.get( id );

				return site ? (
					<ReadyNotice key={ id } site={ site } />
				) : (
					<Notice
						key={ id }
						variant="info"
						title={ __( 'Setting up your new WordPress.com site' ) }
					>
						{ __(
							'We are creating your new WordPress.com site and will show it here once it is ready, which usually takes a few minutes.'
						) }
					</Notice>
				);
			} ) }
		</>
	);
}
