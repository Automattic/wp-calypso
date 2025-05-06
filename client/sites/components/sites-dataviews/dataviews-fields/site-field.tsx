import { ListTile } from '@automattic/components';
import { css } from '@emotion/css';
import styled from '@emotion/styled';
import { useI18n } from '@wordpress/react-i18n';
import clsx from 'clsx';
import { translate } from 'i18n-calypso';
import * as React from 'react';
import { navigate } from 'calypso/lib/navigate';
import SitesMigrationTrialBadge from 'calypso/sites-dashboard/components/sites-migration-trial-badge';
import SitesP2Badge from 'calypso/sites-dashboard/components/sites-p2-badge';
import { SiteName } from 'calypso/sites-dashboard/components/sites-site-name';
import { Truncated } from 'calypso/sites-dashboard/components/sites-site-url';
import SitesStagingBadge from 'calypso/sites-dashboard/components/sites-staging-badge';
import {
	displaySiteUrl,
	getMigrationStatus,
	isP2Site as getIsP2Site,
	isStagingSite,
	isSitePreviewPaneEligible as getIsSitePreviewPaneEligible,
} from 'calypso/sites-dashboard/utils';
import { useSelector } from 'calypso/state';
import { canCurrentUser } from 'calypso/state/selectors/can-current-user';
import { useSiteAdminInterfaceData } from 'calypso/state/sites/hooks';
import { isTrialSite } from 'calypso/state/sites/plans/selectors';
import type { SiteExcerptData } from '@automattic/sites';

type Props = {
	site: SiteExcerptData;
	sitePreviewPane: {
		open: (
			site: SiteExcerptData,
			source: 'site_field' | 'action' | 'list_row_click' | 'environment_switcher',
			openInNewTab?: boolean
		) => void;
		getUrl: ( site: SiteExcerptData ) => string;
	};
};

const SiteListTile = styled( ListTile )`
	gap: 0;
	margin-inline-end: 0;
	width: 280px;
	// Position the item at the top to align with Core, reverting ListTile's default centering.
	align-items: revert;

	.preview-hidden & {
		gap: 12px;
		max-width: 500px;
		width: 100%;
		/*
		 * Ensures the row fits within the device width on mobile in most cases,
		 * as it's not apparent to users that they can scroll horizontally.
		*/
		@media ( max-width: 480px ) {
			width: 250px;
		}
	}
`;

const ListTileTitle = styled.div`
	display: flex;
	align-items: center;
`;

/**
 * Renders an anchor element that can trigger analytics calls
 * or client-side router navigation via the `onNavigate` prop.
 */
const Link = ( {
	disabled,
	href,
	onNavigate,
	...props
}: {
	/** Accessibly disable the link. Use sparingly. */
	disabled?: boolean;
	/** Called when the user wants to navigate to the link. */
	onNavigate?: ( shouldOpenNewTab: boolean, event: React.MouseEvent ) => void;
} & Omit< React.ComponentProps< 'a' >, 'aria-disabled' | 'role' | 'onClick' | 'onAuxClick' > ) => {
	const handleClick = ( event: React.MouseEvent ) => {
		if ( ! onNavigate || disabled ) {
			return;
		}

		event.preventDefault();

		// Ignore if not left or middle click
		if ( event.button > 1 ) {
			return;
		}

		const openInNewTab = event.ctrlKey || event.metaKey || event.button === /* middle click */ 1;
		onNavigate( openInNewTab, event );
	};
	return (
		<a
			href={ disabled ? undefined : href }
			{ ...props }
			aria-disabled={ disabled ? true : undefined }
			role={ disabled ? 'link' : undefined }
			onClick={ handleClick }
			onAuxClick={ handleClick }
		/>
	);
};

const SiteField = ( { site, sitePreviewPane }: Props ) => {
	const { __ } = useI18n();

	let siteUrl = site.URL;
	if ( site.options?.is_redirect && site.options?.unmapped_url ) {
		siteUrl = site.options?.unmapped_url;
	}

	const title = __( 'View Site Details' );
	const { adminUrl } = useSiteAdminInterfaceData( site.ID );

	const isWpcomStagingSite = isStagingSite( site );
	const isTrialSitePlan = useSelector( ( state ) => isTrialSite( state, site.ID ) );

	const canManageOptions = useSelector( ( state ) =>
		canCurrentUser( state, site.ID, 'manage_options' )
	);

	const isP2Site = getIsP2Site( site );
	const isSitePreviewPaneEligible = getIsSitePreviewPaneEligible( site, canManageOptions );

	const onSiteClick = ( shouldOpenNewTab: boolean ) => {
		if ( isSitePreviewPaneEligible ) {
			sitePreviewPane.open( site, 'site_field', shouldOpenNewTab );
		} else {
			navigate( adminUrl, shouldOpenNewTab );
		}
	};

	const isMigrationPending = getMigrationStatus( site ) === 'pending';
	const siteTitle = isMigrationPending ? translate( 'Incoming Migration' ) : site.title;

	return (
		// TODO: Consolidate behavior with `SiteIcon` link
		<Link
			className="sites-dataviews__site"
			disabled={ site.is_deleted }
			href={ isSitePreviewPaneEligible ? sitePreviewPane.getUrl( site ) : adminUrl }
			onNavigate={ onSiteClick }
		>
			<SiteListTile
				contentClassName={ clsx(
					'sites-dataviews__site-name',
					css`
						min-width: 0;
						text-align: start;
					`
				) }
				title={
					<ListTileTitle>
						<SiteName className="sites-dataviews__site-title" as="div" title={ title }>
							<Truncated>{ siteTitle }</Truncated>
						</SiteName>
						{ isP2Site && <SitesP2Badge>P2</SitesP2Badge> }
						{ isWpcomStagingSite && <SitesStagingBadge>{ __( 'Staging' ) }</SitesStagingBadge> }
						{ isTrialSitePlan && (
							<SitesMigrationTrialBadge>{ __( 'Trial' ) }</SitesMigrationTrialBadge>
						) }
					</ListTileTitle>
				}
				subtitle={
					<div className="sites-dataviews__site-urls">
						<Truncated className="sites-dataviews__site-url">
							{ displaySiteUrl( siteUrl ) }
						</Truncated>
					</div>
				}
			/>
		</Link>
	);
};

export default SiteField;
