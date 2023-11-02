import { Gridicon } from '@automattic/components';
import { translate } from 'i18n-calypso';
import { useRef, useState } from 'react';
import Tooltip from 'calypso/components/tooltip';
import { useSelector } from 'calypso/state';
import { isJetpackSiteMultiSite } from 'calypso/state/sites/selectors';
import ToggleActivateMonitoring from '../../downtime-monitoring/toggle-activate-monitoring';
import useRowMetadata from './hooks/use-row-metadata';
import SiteBoostColumn from './site-boost-column';
import SiteNameColumn from './site-name-column';
import SiteStatsColumn from './site-stats-column';
import SiteStatusColumn from './site-status-column';
import type { AllowedTypes, SiteData } from '../types';

interface Props {
	rows: SiteData;
	type: AllowedTypes;
	isLargeScreen?: boolean;
	isFavorite?: boolean;
	siteError: boolean;
}

export default function SiteStatusContent( {
	rows,
	type,
	isLargeScreen = false,
	isFavorite = false,
	siteError,
}: Props ) {
	const metadata = useRowMetadata( rows, type, isLargeScreen );
	const {
		row: { status },
		tooltipId,
		siteDown,
		...metadataRest
	} = metadata;

	let { tooltip } = metadataRest;

	const siteId = rows.site.value.blog_id;

	const isMultiSite = useSelector( ( state ) => isJetpackSiteMultiSite( state, siteId ) );

	// Disable clicks/hover when there is a site error &
	// when the row is not monitor and monitor status is down
	// since monitor is clickable when site is down.
	const disabledStatus = siteError || ( type !== 'monitor' && siteDown );

	// Disable selection and toggle when there is a site error or site is down
	const hasAnyError = !! ( siteError || siteDown );

	const statusContentRef = useRef< HTMLSpanElement | null >( null );
	const [ showTooltip, setShowTooltip ] = useState( false );

	const handleShowTooltip = () => {
		setShowTooltip( true );
	};
	const handleHideTooltip = () => {
		setShowTooltip( false );
	};

	if ( type === 'site' ) {
		return (
			<SiteNameColumn
				rows={ rows }
				isLargeScreen={ isLargeScreen }
				siteError={ siteError }
				isFavorite={ isFavorite }
				hasAnyError={ hasAnyError }
			/>
		);
	}

	let content;

	// Show "Not supported on multisite" when the the site is multisite and the product is Scan or
	// Backup and the site does not have a backup subscription https://href.li/?https://wp.me/pbuNQi-1jg
	const showMultisiteNotSupported =
		isMultiSite && ( type === 'scan' || ( type === 'backup' && ! rows.site.value.has_backup ) );

	if ( showMultisiteNotSupported ) {
		content = <Gridicon icon="minus-small" size={ 18 } className="sites-overview__icon-active" />;
		tooltip = translate( 'Not supported on multisite' );
	} else {
		// We will show "Site Down" when the site is down which is handled differently.
		if ( type === 'monitor' && ! siteDown ) {
			return (
				<ToggleActivateMonitoring
					site={ rows.site.value }
					settings={ rows.monitor.settings }
					status={ status }
					tooltip={ tooltip }
					tooltipId={ tooltipId }
					siteError={ hasAnyError }
					isLargeScreen={ isLargeScreen }
				/>
			);
		}

		if ( type === 'stats' ) {
			return <SiteStatsColumn stats={ rows.stats.value } />;
		}

		// We will show a progress icon when the site score is being fetched.
		if ( type === 'boost' && status !== 'progress' ) {
			return <SiteBoostColumn site={ rows.site.value } />;
		}

		content = (
			<SiteStatusColumn
				type={ type }
				rows={ rows }
				metadata={ metadata }
				disabled={ disabledStatus }
			/>
		);
	}

	return (
		<>
			{ tooltip && ! disabledStatus ? (
				<>
					<span
						ref={ statusContentRef }
						role="button"
						tabIndex={ 0 }
						onMouseEnter={ handleShowTooltip }
						onMouseLeave={ handleHideTooltip }
						onMouseDown={ handleHideTooltip }
						className="sites-overview__row-status"
					>
						{ content }
					</span>
					<Tooltip
						id={ tooltipId }
						context={ statusContentRef.current }
						isVisible={ showTooltip }
						position="bottom"
						className="sites-overview__tooltip"
					>
						{ tooltip }
					</Tooltip>
				</>
			) : (
				<span className="sites-overview__row-status">{ content }</span>
			) }
		</>
	);
}
