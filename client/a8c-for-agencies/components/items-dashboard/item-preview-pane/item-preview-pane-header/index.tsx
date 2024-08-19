import config from '@automattic/calypso-config';
import { Gridicon } from '@automattic/components';
import { Button } from '@wordpress/components';
import { useMediaQuery } from '@wordpress/compose';
import { Icon, external } from '@wordpress/icons';
import clsx from 'clsx';
import { translate } from 'i18n-calypso';
import { useEffect, useRef } from 'react';
import QuerySitePhpVersion from 'calypso/components/data/query-site-php-version';
import QuerySiteWpVersion from 'calypso/components/data/query-site-wp-version';
import { useSelector, useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { getAtomicHostingPhpVersion } from 'calypso/state/selectors/get-atomic-hosting-php-version';
import { getAtomicHostingWpVersion } from 'calypso/state/selectors/get-atomic-hosting-wp-version';
import isSiteWpcomAtomic from 'calypso/state/selectors/is-site-wpcom-atomic';
import isSiteWpcomStaging from 'calypso/state/selectors/is-site-wpcom-staging';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import SiteFavicon from '../../site-favicon';
import { ItemData, ItemPreviewPaneHeaderExtraProps } from '../types';

import './style.scss';

const ICON_SIZE_SMALL = 16;
const ICON_SIZE_REGULAR = 24;

interface Props {
	closeItemPreviewPane?: () => void;
	itemData: ItemData;
	isPreviewLoaded: boolean;
	className?: string;
	extraProps?: ItemPreviewPaneHeaderExtraProps;
}

export default function ItemPreviewPaneHeader( {
	itemData,
	isPreviewLoaded,
	closeItemPreviewPane,
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
		config.isEnabled( 'hosting-overview-refinements' ) && isAtomic && ( wpVersion || phpVersion );

	const handlePhpVersionClick = () => {
		dispatch( recordTracksEvent( 'calypso_hosting_configuration_php_version_update' ) );
	};

	const handleWpVersionClick = () => {
		dispatch( recordTracksEvent( 'calypso_hosting_configuration_wp_version_update' ) );
	};

	return (
		<>
			{ isAtomic && <QuerySitePhpVersion siteId={ siteId } /> }
			{ isAtomic && <QuerySiteWpVersion siteId={ siteId } /> }
			<div className={ clsx( 'item-preview__header', className ) }>
				<div className="item-preview__header-content">
					{ !! itemData?.withIcon && (
						<SiteFavicon
							blogId={ itemData.blogId }
							fallback={ siteIconFallback }
							color={ itemData.color }
							className="item-preview__header-favicon"
							size={ size }
						/>
					) }
					<div className="item-preview__header-info">
						<div className="item-preview__header-title-summary">
							<div className="item-preview__header-title">{ itemData.title }</div>
							<div className="item-preview__header-summary">
								{ itemData?.url ? (
									<Button
										variant="link"
										className="item-preview__header-summary-link"
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
								<div className="item-preview__header-env-data">
									{ wpVersion && (
										<div className="item-preview__header-env-data-item">
											WordPress{ ' ' }
											<a
												className="item-preview__header-env-data-item-link"
												href={ `/hosting-config/${ selectedSite?.domain }#wp` }
												onClick={ handleWpVersionClick }
											>
												{ wpVersion }
												{ wpVersionName && isStagingSite && <span> ({ wpVersionName })</span> }
											</a>
										</div>
									) }

									{ phpVersion && (
										<div className="item-preview__header-env-data-item">
											PHP{ ' ' }
											<a
												className="item-preview__header-env-data-item-link"
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
							<div className="item-preview__header-actions">
								{ extraProps?.headerButtons ? (
									<extraProps.headerButtons
										focusRef={ focusRef }
										itemData={ itemData }
										closeSitePreviewPane={ closeItemPreviewPane || ( () => {} ) }
									/>
								) : (
									<Button
										onClick={ closeItemPreviewPane }
										className="item-preview__close-preview"
										aria-label={ translate( 'Close Preview' ) }
										ref={ focusRef }
									>
										<Gridicon icon="cross" size={ ICON_SIZE_REGULAR } />
									</Button>
								) }
							</div>
						) }
					</div>
				</div>
			</div>
		</>
	);
}
