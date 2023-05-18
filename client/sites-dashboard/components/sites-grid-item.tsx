import { PLAN_ECOMMERCE_TRIAL_MONTHLY } from '@automattic/calypso-products';
import { Button } from '@automattic/components';
import { useSiteLaunchStatusLabel, getSiteLaunchStatus } from '@automattic/sites';
import { css } from '@emotion/css';
import styled from '@emotion/styled';
import { useI18n } from '@wordpress/react-i18n';
import { memo, useEffect, useRef, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import { SiteExcerptData } from 'calypso/data/sites/site-excerpt-types';
import { useCheckSiteTransferStatus } from '../hooks/use-check-site-transfer-status';
import { displaySiteUrl, getDashboardUrl, isStagingSite } from '../utils';
import { SitesEllipsisMenu } from './sites-ellipsis-menu';
import { SitesGridActionRenew } from './sites-grid-action-renew';
import { SitesGridTile } from './sites-grid-tile';
import SitesLaunchStatusBadge from './sites-launch-status-badge';
import SitesP2Badge from './sites-p2-badge';
import { SiteItemThumbnail } from './sites-site-item-thumbnail';
import { SiteLaunchNag } from './sites-site-launch-nag';
import { SiteName } from './sites-site-name';
import { SiteUrl, Truncated } from './sites-site-url';
import SitesStagingBadge from './sites-staging-badge';
import { SitesTransferNotice } from './sites-transfer-notice';
import { ThumbnailLink } from './thumbnail-link';

const SIZES_ATTR = [
	'(min-width: 1345px) calc((1280px - 64px) / 3)',
	'(min-width: 960px) calc((100vw - 128px) / 3)',
	'(min-width: 780px) calc((100vw - 96px) / 2)',
	'(min-width: 660px) calc((100vw - 64px) / 2)',
	'calc(100vw - 32px)',
].join( ', ' );

const ASPECT_RATIO = 16 / 11;

const THUMBNAIL_DIMENSION = {
	width: 401,
	height: 401 / ASPECT_RATIO,
};

const badges = css( {
	display: 'flex',
	gap: '8px',
	alignItems: 'center',
	marginInlineStart: 'auto',
} );

const selectAction = css( {
	display: 'flex',
	gap: '8px',
	alignItems: 'center',
	marginInlineStart: 'auto',
	button: {
		whiteSpace: 'nowrap',
	},
} );

export const siteThumbnail = css( {
	aspectRatio: '16 / 11',
	width: '100%',
	height: 'auto',
	boxSizing: 'border-box',
} );

const SitesGridItemSecondary = styled.div( {
	display: 'flex',
	gap: '32px',
	justifyContent: 'space-between',
} );

const EllipsisMenuContainer = styled.div( {
	width: '24px',
} );

const ellipsis = css( {
	'.button.ellipsis-menu__toggle': {
		padding: 0,
	},

	'.gridicon.ellipsis-menu__toggle-icon': {
		width: '24px',
		height: '16px',
		insetBlockStart: '4px',
	},
} );

interface SitesGridItemProps {
	site: SiteExcerptData;
	showLaunchNag?: boolean;
	showBadgeSection?: boolean;
	showThumbnailLink?: boolean;
	showSiteRenewLink?: boolean;
	onSiteSelectBtnClick?: ( site: SiteExcerptData ) => void;
}

export const SitesGridItem = memo( ( props: SitesGridItemProps ) => {
	const { __ } = useI18n();
	const {
		site,
		showLaunchNag = true,
		showBadgeSection = true,
		showThumbnailLink = true,
		showSiteRenewLink = true,
		onSiteSelectBtnClick,
	} = props;

	const isP2Site = site.options?.is_wpforteams_site;
	const isWpcomStagingSite = isStagingSite( site );
	const translatedStatus = useSiteLaunchStatusLabel( site );
	const isECommerceTrialSite = site.plan?.product_slug === PLAN_ECOMMERCE_TRIAL_MONTHLY;
	const { isTransferring, isTransferCompleted } = useCheckSiteTransferStatus( { siteId: site.ID } );
	const [ wasTransferring, setWasTransferring ] = useState( false );
	const dismissTransferNoticeRef = useRef< NodeJS.Timeout >();

	const { ref, inView } = useInView( { triggerOnce: true } );

	const ThumbnailWrapper = showThumbnailLink ? ThumbnailLink : 'div';

	const siteDashboardUrlProps = showThumbnailLink
		? {
				href: getDashboardUrl( site.slug ),
				title: __( 'Visit Dashboard' ),
		  }
		: {};

	let siteUrl = site.URL;
	if ( site.options?.is_redirect && site.options?.unmapped_url ) {
		siteUrl = site.options?.unmapped_url;
	}

	useEffect( () => {
		if ( isTransferring && ! wasTransferring ) {
			setWasTransferring( true );
		} else if ( ! isTransferring && wasTransferring && isTransferCompleted ) {
			dismissTransferNoticeRef.current = setTimeout( () => {
				setWasTransferring( false );
			}, 3000 );
		}

		return () => clearTimeout( dismissTransferNoticeRef.current );
	}, [ isTransferring, isTransferCompleted, wasTransferring, setWasTransferring ] );

	return (
		<SitesGridTile
			ref={ ref }
			leading={
				<>
					<ThumbnailWrapper { ...siteDashboardUrlProps }>
						<SiteItemThumbnail
							displayMode="tile"
							className={ siteThumbnail }
							showPlaceholder={ ! inView }
							site={ site }
							width={ THUMBNAIL_DIMENSION.width }
							height={ THUMBNAIL_DIMENSION.height }
							sizesAttr={ SIZES_ATTR }
						/>
					</ThumbnailWrapper>
					{ showSiteRenewLink && site.plan?.expired && (
						<SitesGridActionRenew site={ site } hideRenewLink={ isECommerceTrialSite } />
					) }
					{ isTransferring && <SitesTransferNotice isTransfering={ true } /> }
					{ wasTransferring && isTransferCompleted && (
						<SitesTransferNotice isTransfering={ false } />
					) }
				</>
			}
			primary={
				<>
					<SiteName fontSize={ 16 } { ...siteDashboardUrlProps }>
						{ site.title }
					</SiteName>

					{ showBadgeSection && (
						<div className={ badges }>
							{ isP2Site && <SitesP2Badge>P2</SitesP2Badge> }
							{ isWpcomStagingSite && <SitesStagingBadge>{ __( 'Staging' ) }</SitesStagingBadge> }
							{ getSiteLaunchStatus( site ) !== 'public' && (
								<SitesLaunchStatusBadge>{ translatedStatus }</SitesLaunchStatusBadge>
							) }
							<EllipsisMenuContainer>
								{ inView && <SitesEllipsisMenu className={ ellipsis } site={ site } /> }
							</EllipsisMenuContainer>
						</div>
					) }
					{ onSiteSelectBtnClick && (
						<div className={ selectAction }>
							<Button
								compact={ true }
								primary={ true }
								onClick={ () => onSiteSelectBtnClick( site ) }
							>
								{ __( 'Select this site' ) }
							</Button>
						</div>
					) }
				</>
			}
			secondary={
				<SitesGridItemSecondary>
					<SiteUrl href={ siteUrl } title={ siteUrl }>
						<Truncated>{ displaySiteUrl( siteUrl ) }</Truncated>
					</SiteUrl>
					{ showLaunchNag && <SiteLaunchNag site={ site } /> }
				</SitesGridItemSecondary>
			}
		/>
	);
} );
