import { activeAgencyQuery, provisionedAgencySitesQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { Button, ExternalLink } from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import Notice from '../../components/notice';
import { untrackProvisioningSite, useProvisioningSiteIds } from './provisioning-sites';
import type { ProvisionedAgencySite } from '@automattic/api-core';

const POLL_INTERVAL_MS = 5000;

/**
 * This notice renders on every `/sites` load and polls, so a response that is
 * not the expected list must not take the route down with it.
 */
function toSiteList( data: unknown ): ProvisionedAgencySite[] {
	return Array.isArray( data ) ? data : [];
}

function isReady( site: ProvisionedAgencySite ): boolean {
	return site.features?.wpcom_atomic?.state === 'active';
}

function siteUrlWithScheme( url: string ): string {
	return url.startsWith( 'http' ) ? url : `https://${ url }`;
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
	const { data: agency } = useQuery( activeAgencyQuery() );

	const { data: sites } = useQuery( {
		...provisionedAgencySitesQuery( agency?.id ?? 0 ),
		enabled: !! agency?.id && provisioningSiteIds.length > 0,
		refetchInterval: ( { state } ) => {
			const readyIds = toSiteList( state.data )
				.filter( isReady )
				.map( ( { id } ) => id );
			const isWaiting = provisioningSiteIds.some( ( id ) => ! readyIds.includes( id ) );
			return isWaiting ? POLL_INTERVAL_MS : false;
		},
	} );

	if ( ! provisioningSiteIds.length ) {
		return null;
	}

	const readySites = new Map(
		toSiteList( sites )
			.filter( isReady )
			.map( ( site ) => [ site.id, site ] )
	);

	return (
		<>
			{ provisioningSiteIds.map( ( id ) => {
				const site = readySites.get( id );

				// One <Notice> across both states rather than a component per state:
				// swapping the mounted element when the site reports ready crashes
				// React under Google Translate (react/react#11538).
				return (
					<Notice
						key={ id }
						variant={ site ? 'success' : 'info' }
						title={
							site
								? __( 'Your WordPress.com site is ready!' )
								: __( 'Setting up your new WordPress.com site' )
						}
						onClose={ () => untrackProvisioningSite( id ) }
						actions={
							site && (
								<Button
									variant="primary"
									href={ siteUrlWithScheme( site.url ) }
									target="_blank"
									rel="noreferrer"
								>
									{ __( 'Set up your site' ) }
								</Button>
							)
						}
					>
						<span>
							{ site
								? createInterpolateElement(
										__(
											'<address /> is now ready. It may take a few minutes to appear in the list below.'
										),
										{
											address: (
												<ExternalLink href={ siteUrlWithScheme( site.url ) }>
													{ site.url }
												</ExternalLink>
											),
										}
								  )
								: __(
										'We are creating your new WordPress.com site and will show it here once it is ready, which usually takes a few minutes.'
								  ) }
						</span>
					</Notice>
				);
			} ) }
		</>
	);
}
