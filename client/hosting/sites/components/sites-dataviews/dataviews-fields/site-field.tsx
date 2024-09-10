import { ListTile, Button } from '@automattic/components';
import { css } from '@emotion/css';
import styled from '@emotion/styled';
import { Icon, external } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import clsx from 'clsx';
import * as React from 'react';
//import { useInView } from 'react-intersection-observer';
import SiteFavicon from 'calypso/a8c-for-agencies/components/items-dashboard/site-favicon';
import { navigate } from 'calypso/lib/navigate';
import { isP2Theme } from 'calypso/lib/site/utils';
import SitesMigrationTrialBadge from 'calypso/sites-dashboard/components/sites-migration-trial-badge';
import SitesP2Badge from 'calypso/sites-dashboard/components/sites-p2-badge';
import { SiteName } from 'calypso/sites-dashboard/components/sites-site-name';
import { Truncated } from 'calypso/sites-dashboard/components/sites-site-url';
import SitesStagingBadge from 'calypso/sites-dashboard/components/sites-staging-badge';
import { ThumbnailLink } from 'calypso/sites-dashboard/components/thumbnail-link';
import {
	displaySiteUrl,
	isNotAtomicJetpack,
	isStagingSite,
	MEDIA_QUERIES,
} from 'calypso/sites-dashboard/utils';
import { useSelector } from 'calypso/state';
import { canCurrentUser } from 'calypso/state/selectors/can-current-user';
import { useSiteAdminInterfaceData } from 'calypso/state/sites/hooks';
import { isTrialSite } from 'calypso/state/sites/plans/selectors';
import type { SiteExcerptData } from '@automattic/sites';

type Props = {
	site: SiteExcerptData;
	openSitePreviewPane?: ( site: SiteExcerptData ) => void;
};

const SiteListTile = styled( ListTile )`
	gap: 0;
	margin-inline-end: 0;
	width: 280px;

	.preview-hidden & {
		gap: 12px;
		max-width: 500px;
		width: 100%;
	}

	${ MEDIA_QUERIES.hideTableRows } {
		margin-inline-end: 12px;
	}
`;

const ListTileLeading = styled( ThumbnailLink )`
	${ MEDIA_QUERIES.hideTableRows } {
		margin-inline-end: 12px;
	}
`;

const ListTileTitle = styled.div`
	display: flex;
	align-items: center;
`;

const SiteField = ( { site, openSitePreviewPane }: Props ) => {
	const { __ } = useI18n();

	// Todo: This hook is used by the SiteItemThumbnail component below, in a prop showPlaceholder={ ! inView }.
	// It does not work as expected. Fix it.
	// const { inView } = useInView( { triggerOnce: true } );

	let siteUrl = site.URL;
	if ( site.options?.is_redirect && site.options?.unmapped_url ) {
		siteUrl = site.options?.unmapped_url;
	}

	const title = __( 'View Site Details' );
	const { adminLabel, adminUrl } = useSiteAdminInterfaceData( site.ID );

	const isP2Site = site.options?.theme_slug && isP2Theme( site.options?.theme_slug );
	const isWpcomStagingSite = isStagingSite( site );
	const isTrialSitePlan = useSelector( ( state ) => isTrialSite( state, site.ID ) );

	const isAdmin = useSelector( ( state ) => canCurrentUser( state, site.ID, 'manage_options' ) );

	const onSiteClick = ( event: React.MouseEvent ) => {
		if ( isAdmin && ! isP2Site && ! isNotAtomicJetpack( site ) ) {
			openSitePreviewPane && openSitePreviewPane( site );
		} else {
			navigate( adminUrl );
		}
		event.preventDefault();
	};

	return (
		<div className="sites-dataviews__site">
			<SiteListTile
				contentClassName={ clsx(
					'sites-dataviews__site-name',
					css`
						min-width: 0;
						text-align: start;
					`
				) }
				leading={
					<Button
						className="sites-dataviews__preview-trigger"
						onClick={ onSiteClick }
						borderless
						disabled={ site.is_deleted }
					>
						<ListTileLeading title={ title }>
							<SiteFavicon
								className="sites-site-favicon"
								blogId={ site.ID }
								fallback="first-grapheme"
								size={ 56 }
							/>
						</ListTileLeading>
					</Button>
				}
				title={
					<ListTileTitle>
						<SiteName as="div" title={ title }>
							<Truncated>{ site.title }</Truncated>
						</SiteName>
						{ isP2Site && <SitesP2Badge>P2</SitesP2Badge> }
						{ isWpcomStagingSite && <SitesStagingBadge>{ __( 'Staging' ) }</SitesStagingBadge> }
						{ isTrialSitePlan && (
							<SitesMigrationTrialBadge>{ __( 'Trial' ) }</SitesMigrationTrialBadge>
						) }
					</ListTileTitle>
				}
				subtitle={
					site.is_deleted ? (
						<>
							<Truncated>{ displaySiteUrl( siteUrl ) }</Truncated>
						</>
					) : (
						<>
							<div className="sites-dataviews__site-urls">
								<a
									className="sites-dataviews__site-url"
									href={ siteUrl }
									title={ siteUrl }
									target="_blank"
									rel="noreferrer"
								>
									<Truncated>
										{ displaySiteUrl( siteUrl ) }
										<Icon icon={ external } size={ 16 } />
									</Truncated>
								</a>
							</div>
							<a className="sites-dataviews__site-wp-admin-url" href={ adminUrl }>
								<Truncated>{ adminLabel }</Truncated>
							</a>
						</>
					)
				}
			/>
		</div>
	);
};

export default SiteField;
