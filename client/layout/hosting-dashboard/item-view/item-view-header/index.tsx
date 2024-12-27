import { Gridicon } from '@automattic/components';
import { Button } from '@wordpress/components';
import { useMediaQuery } from '@wordpress/compose';
import { Icon, external } from '@wordpress/icons';
import clsx from 'clsx';
import { translate } from 'i18n-calypso';
import { useEffect, useRef } from 'react';
import SiteFavicon from 'calypso/blocks/site-favicon';
import QuerySitePhpVersion from 'calypso/components/data/query-site-php-version';
import QuerySiteWpVersion from 'calypso/components/data/query-site-wp-version';
import { isWpMobileApp } from 'calypso/lib/mobile-app';
import { useSelector, useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { getAtomicHostingPhpVersion } from 'calypso/state/selectors/get-atomic-hosting-php-version';
import { getAtomicHostingWpVersion } from 'calypso/state/selectors/get-atomic-hosting-wp-version';
import isSiteWpcomAtomic from 'calypso/state/selectors/is-site-wpcom-atomic';
import isSiteWpcomStaging from 'calypso/state/selectors/is-site-wpcom-staging';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import { ItemData, ItemViewHeaderExtraProps } from '../types';

import './style.scss';

const ICON_SIZE_SMALL = 16;
const ICON_SIZE_REGULAR = 24;

interface Props {
	closeItemView?: () => void;
	itemData: ItemData;
	isPreviewLoaded: boolean;
	className?: string;
	extraProps?: ItemViewHeaderExtraProps;
}

export default function ItemViewHeader( {
	itemData,
	isPreviewLoaded,
	closeItemView,
	className,
	extraProps,
}: Props ) {
	const dispatch = useDispatch();
	const isLargerThan960px = useMediaQuery( '(min-width: 960px)' );
	const size = isLargerThan960px ? 64 : 50;
	const selectedSite = useSelector( getSelectedSite );
	const siteId = selectedSite?.ID || 0;
	const phpVersion = useSelector( ( state ) => getAtomicHostingPhpVersion( state, siteId ) );
	const wpVersionName = useSelector( ( state ) => getAtomicHostingWpVersion( state, siteId ) );
	const wpVersion = selectedSite?.options?.software_version?.match( /^\d+(\.\d+){0,2}/ )?.[ 0 ]; // Some times it can be `6.6.1-alpha-58760`, so we strip the `-alpha-58760` part
	const isAtomic = useSelector( ( state ) => isSiteWpcomAtomic( state, siteId ) );
	const isStagingSite = useSelector( ( state ) => isSiteWpcomStaging( state, siteId ) );
	const isMobileApp = isWpMobileApp();

	const focusRef = useRef< HTMLButtonElement >( null );

	// Use useEffect to set the focus when the component mounts
	useEffect( () => {
		if ( focusRef.current ) {
			focusRef.current.focus();
		}
	}, [] );

	const siteIconFallback =
		extraProps?.siteIconFallback ?? ( itemData.isDotcomSite ? 'wordpress-logo' : 'color' );

	const shouldDisplayVersionNumbers =
		! itemData.hideEnvDataInHeader && isAtomic && ( wpVersion || phpVersion );

	const handlePhpVersionClick = () => {
		dispatch( recordTracksEvent( 'calypso_hosting_php_version_click' ) );
	};

	const handleWpVersionClick = () => {
		dispatch( recordTracksEvent( 'calypso_hosting_wp_version_click' ) );
	};

	return (
		<>
			{ isAtomic && <QuerySitePhpVersion siteId={ siteId } /> }
			{ isAtomic && <QuerySiteWpVersion siteId={ siteId } /> }
			<div className={ clsx( 'hosting-dashboard-item-view__header', className ) }>
				<div className="hosting-dashboard-item-view__header-content">
					{ ! isMobileApp && (
						<>
							{ !! itemData?.withIcon && (
								<SiteFavicon
									blogId={ itemData.blogId }
									fallback={ siteIconFallback }
									color={ itemData.color }
									className="hosting-dashboard-item-view__header-favicon"
									size={ size }
								/>
							) }
							<div className="hosting-dashboard-item-view__header-info">
								<div className="hosting-dashboard-item-view__header-title-summary">
									<div className="hosting-dashboard-item-view__header-title">
										{ itemData.title }
									</div>
									<div className="hosting-dashboard-item-view__header-summary">
										{ itemData?.url ? (
											<Button
												variant="link"
												className="hosting-dashboard-item-view__header-summary-link"
												href={ itemData.url }
												target="_blank"
											>
												<span>
													{ itemData.subtitle }
													<Icon
														className="sidebar-v2__external-icon"
														icon={ external }
														size={ extraProps?.externalIconSize || ICON_SIZE_SMALL }
													/>
												</span>
											</Button>
										) : (
											itemData.subtitle
										) }

										{ extraProps && extraProps.subtitleExtra ? (
											<span>
												<extraProps.subtitleExtra />
											</span>
										) : (
											''
										) }
									</div>

									{ shouldDisplayVersionNumbers && (
										<div className="hosting-dashboard-item-view__header-env-data">
											{ wpVersion && (
												<div className="hosting-dashboard-item-view__header-env-data-item">
													WordPress{ ' ' }
													<a
														className="hosting-dashboard-item-view__header-env-data-item-link"
														href={ `/hosting-config/${ selectedSite?.domain }#wp` }
														onClick={ handleWpVersionClick }
													>
														{ wpVersion }
														{ wpVersionName && isStagingSite && <span> ({ wpVersionName })</span> }
													</a>
												</div>
											) }

											{ phpVersion && (
												<div className="hosting-dashboard-item-view__header-env-data-item">
													PHP{ ' ' }
													<a
														className="hosting-dashboard-item-view__header-env-data-item-link"
														onClick={ handlePhpVersionClick }
														href={ `/hosting-config/${ selectedSite?.domain }#php` }
													>
														{ phpVersion }
													</a>
												</div>
											) }
										</div>
									) }
								</div>

								{ isPreviewLoaded && (
									<div className="hosting-dashboard-item-view__header-actions">
										{ extraProps?.headerButtons ? (
											<extraProps.headerButtons
												focusRef={ focusRef }
												itemData={ itemData }
												closeSitePreviewPane={ closeItemView || ( () => {} ) }
											/>
										) : (
											<Button
												onClick={ closeItemView }
												className="hosting-dashboard-item-view__close"
												aria-label={ translate( 'Close Preview' ) }
												ref={ focusRef }
											>
												<Gridicon icon="cross" size={ ICON_SIZE_REGULAR } />
											</Button>
										) }
									</div>
								) }
							</div>
						</>
					) }
				</div>
			</div>
		</>
	);
}
