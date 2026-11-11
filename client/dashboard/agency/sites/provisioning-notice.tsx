import {
	activeAgencyQuery,
	agencySitesQuery,
	provisionedAgencySitesQuery,
	siteBySlugQuery,
} from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { Button, ExternalLink } from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { useEffect, useMemo, useState } from 'react';
import Notice from '../../components/notice';
import { wpcomLink } from '../../utils/link';
import { MilestoneFeedbackModal, useMilestoneFeedback } from '../feedback';
import {
	holdProvisioningSite,
	untrackProvisioningSite,
	useProvisioningSiteIds,
} from './provisioning-sites';
import type { MigrationCommissionSite } from '@automattic/api-core';

const POLL_INTERVAL_MS = 5000;
const SITE_LIST_POLL_INTERVAL_MS = 15000;
// Ten minutes of checks, after which the button keeps opening WordPress.com.
const SITE_LIST_POLL_LIMIT = 40;

/**
 * This notice renders on every `/sites` load and polls, so a response that is
 * not the expected list must not take the route down with it.
 */
function toSiteList( data: unknown ): MigrationCommissionSite[] {
	return Array.isArray( data ) ? data : [];
}

function isReady( site: MigrationCommissionSite ): boolean {
	return site.features?.wpcom_atomic?.state === 'active';
}

// The list reports `http://{name}.wordpress.com/`; routes and overview URLs take
// the bare host.
function getSiteSlug( url: string ): string {
	return url.replace( /^\w+:\/\//, '' ).replace( /\/$/, '' );
}

/**
 * The agency site page only opens a site the agency site list already has, and
 * a new site can take a few minutes to appear there after it reports ready.
 * Until it does, the button opens the site on WordPress.com instead.
 */
function SetUpSiteButton( {
	siteSlug,
	onClick,
}: {
	siteSlug: string;
	onClick: ( event: React.MouseEvent, isListed: boolean ) => void;
} ) {
	const { data: site } = useQuery( siteBySlugQuery( siteSlug ) );
	const hasSite = ( sites?: { blog_id: number }[] ) =>
		!! site && !! sites?.some( ( { blog_id } ) => blog_id === site.ID );

	// The same search the site page runs first, kept to one small request a check
	// rather than the page's fallback to the whole list.
	const { data: searchResults } = useQuery( {
		...agencySitesQuery( {
			search: siteSlug.replace( /^www\./, '' ).split( '.' )[ 0 ],
			per_page: 100,
		} ),
		refetchInterval: ( { state } ) =>
			hasSite( state.data ) ||
			state.dataUpdateCount + state.errorUpdateCount >= SITE_LIST_POLL_LIMIT
				? false
				: SITE_LIST_POLL_INTERVAL_MS,
	} );
	const isListed = hasSite( searchResults );

	// One <Button> whichever way it points: swapping elements crashes React
	// under Google Translate (react/react#11538).
	return (
		<Button
			variant="primary"
			href={ isListed ? `/sites/${ siteSlug }` : wpcomLink( `/overview/${ siteSlug }` ) }
			target={ isListed ? undefined : '_blank' }
			rel={ isListed ? undefined : 'noreferrer' }
			onClick={ ( event: React.MouseEvent ) => {
				// Leave new-tab and new-window clicks to the browser.
				if (
					event.button !== 0 ||
					event.metaKey ||
					event.ctrlKey ||
					event.shiftKey ||
					event.altKey
				) {
					return;
				}
				onClick( event, isListed );
			} }
			__next40pxDefaultSize
		>
			{ __( 'Set up your site' ) }
		</Button>
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
	const { data: agency } = useQuery( activeAgencyQuery() );
	const navigate = useNavigate();
	// Open while the survey shows; `siteSlug` is the site to open once it closes.
	const [ feedback, setFeedback ] = useState< { siteSlug?: string } >();
	const { shouldAsk } = useMilestoneFeedback( 'purchase-completed' );

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

	const readySites = useMemo(
		() =>
			new Map(
				toSiteList( sites )
					.filter( isReady )
					.map( ( site ) => [ site.id, site ] as const )
			),
		[ sites ]
	);

	// A site that has reported ready keeps its notice until it is dismissed. The
	// TTL is there to drop the ones that never got an answer, and it would
	// otherwise pull this result out from under whoever is reading it.
	useEffect( () => {
		provisioningSiteIds.filter( ( id ) => readySites.has( id ) ).forEach( holdProvisioningSite );
	}, [ provisioningSiteIds, readySites ] );

	return (
		<>
			{ provisioningSiteIds.map( ( id ) => {
				const site = readySites.get( id );
				const siteSlug = site ? getSiteSlug( site.url ) : '';
				const overviewUrl = site ? wpcomLink( `/overview/${ siteSlug }` ) : '';

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
								<SetUpSiteButton
									siteSlug={ siteSlug }
									onClick={ ( event, isListed ) => {
										if ( isListed ) {
											event.preventDefault();
										} else if ( ! shouldAsk ) {
											return;
										}
										untrackProvisioningSite( id );
										if ( shouldAsk ) {
											setFeedback( { siteSlug: isListed ? siteSlug : undefined } );
										} else {
											navigate( { to: `/sites/${ siteSlug }` } );
										}
									} }
								/>
							)
						}
					>
						<span>
							{ site
								? createInterpolateElement(
										__(
											/* translators: <address /> is the address of the site that was created, e.g. example.wpcomstaging.com */
											'<address /> is now ready. It may take a few minutes to appear in the list below.'
										),
										{
											address: (
												<ExternalLink href={ overviewUrl }>
													{ getSiteSlug( site.url ) }
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
			{ feedback && (
				<MilestoneFeedbackModal
					type="purchase-completed"
					onClose={ () => {
						setFeedback( undefined );
						if ( feedback.siteSlug ) {
							navigate( { to: `/sites/${ feedback.siteSlug }` } );
						}
					} }
				/>
			) }
		</>
	);
}
