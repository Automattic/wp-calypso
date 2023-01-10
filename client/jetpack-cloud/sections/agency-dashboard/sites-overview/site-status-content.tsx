import { isEnabled } from '@automattic/calypso-config';
import { Button, Gridicon } from '@automattic/components';
import { addQueryArgs } from '@wordpress/url';
import classNames from 'classnames';
import { translate } from 'i18n-calypso';
import page from 'page';
import { useRef, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Badge from 'calypso/components/badge';
import Tooltip from 'calypso/components/tooltip';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { selectLicense, unselectLicense } from 'calypso/state/jetpack-agency-dashboard/actions';
import { hasSelectedLicensesOfType } from 'calypso/state/jetpack-agency-dashboard/selectors';
import ToggleActivateMonitoring from '../downtime-monitoring/toggle-activate-monitoring';
import SiteSetFavorite from './site-set-favorite';
import { getRowMetaData, getProductSlugFromProductType } from './utils';
import type { AllowedTypes, SiteData } from './types';

interface Props {
	rows: SiteData;
	type: AllowedTypes;
	isLargeScreen?: boolean;
	isFavorite?: boolean;
}

export default function SiteStatusContent( {
	rows,
	type,
	isLargeScreen = false,
	isFavorite = false,
}: Props ) {
	const dispatch = useDispatch();

	const {
		link,
		isExternalLink,
		row: { value, status, error },
		siteError,
		tooltip,
		tooltipId,
		siteDown,
		eventName,
	} = getRowMetaData( rows, type, isLargeScreen );

	const siteId = rows.site.value.blog_id;
	const siteUrl = rows.site.value.url;

	const isLicenseSelected = useSelector( ( state ) =>
		hasSelectedLicensesOfType( state, siteId, type )
	);

	// Disable clicks/hover when there is a site error &
	// when the row it is not monitor and monitor status is down
	// since monitor is clickable when site is down.
	const disabledStatus = siteError || ( type !== 'monitor' && siteDown );

	const statusContentRef = useRef< HTMLSpanElement | null >( null );
	const [ showTooltip, setShowTooltip ] = useState( false );

	const handleShowTooltip = () => {
		setShowTooltip( true );
	};
	const handleHideTooltip = () => {
		setShowTooltip( false );
	};

	const handleClickRowAction = () => {
		dispatch( recordTracksEvent( eventName ) );
	};

	const issueLicenseRedirectUrl = useMemo( () => {
		return addQueryArgs( `/partner-portal/issue-license/`, {
			site_id: siteId,
			product_slug: getProductSlugFromProductType( type ),
			source: 'dashboard',
		} );
	}, [ siteId, type ] );

	const handleSelectLicenseAction = () => {
		const inactiveProducts = Object.values( rows ).filter( ( row ) => row?.status === 'inactive' );
		if ( inactiveProducts.length > 1 ) {
			return dispatch( selectLicense( siteId, type ) );
		}
		// Redirect to issue-license if there is only one inactive product available for a site
		return page( issueLicenseRedirectUrl );
	};

	const handleDeselectLicenseAction = () => {
		dispatch( unselectLicense( siteId, type ) );
	};

	if ( type === 'site' ) {
		// Site issues is the sum of scan threats and plugin updates
		let siteIssuesCount = rows.scan.threats + rows.plugin.updates;
		let isHighSeverityError = !! rows.scan.threats;
		if ( [ 'failed', 'warning' ].includes( rows.backup.status ) ) {
			siteIssuesCount = siteIssuesCount + 1;
			isHighSeverityError = isHighSeverityError || 'failed' === rows.backup.status;
		}
		if ( [ 'failed' ].includes( rows.monitor.status ) ) {
			siteIssuesCount = siteIssuesCount + 1;
			isHighSeverityError = true;
		}
		let errorContent;
		if ( error ) {
			errorContent = (
				<span className="sites-overview__status-critical">
					<Gridicon size={ 24 } icon="notice-outline" />
				</span>
			);
		} else if ( siteIssuesCount ) {
			errorContent = (
				<span
					className={ classNames(
						'sites-overview__status-count',
						isHighSeverityError ? 'sites-overview__status-failed' : 'sites-overview__status-warning'
					) }
				>
					{ siteIssuesCount }
				</span>
			);
		}

		return (
			<>
				<SiteSetFavorite
					isFavorite={ isFavorite }
					siteId={ rows.site.value.blog_id }
					siteUrl={ siteUrl }
				/>
				{ isLargeScreen ? (
					<Button
						className="sites-overview__row-text"
						borderless
						compact
						href={ `/activity-log/${ siteUrl }` }
					>
						{ siteUrl }
					</Button>
				) : (
					<span className="sites-overview__row-text">{ siteUrl }</span>
				) }
				<span className="sites-overview__overlay"></span>
				{ errorContent }
			</>
		);
	}

	const isDownTimeMonitorEnabled = isEnabled(
		'jetpack/partner-portal-downtime-monitoring-updates'
	);

	// We will show "Site Down" when the site is down which is handled differently.
	if ( isDownTimeMonitorEnabled && type === 'monitor' && ! siteDown ) {
		return (
			<ToggleActivateMonitoring
				site={ rows.site.value }
				settings={ rows.monitor.settings }
				status={ status }
				siteError={ siteError }
			/>
		);
	}

	let content;

	switch ( status ) {
		case 'failed': {
			content = (
				<Badge className="sites-overview__badge" type="error">
					{ value }
				</Badge>
			);
			break;
		}
		case 'warning': {
			content = (
				<Badge className="sites-overview__badge" type="warning">
					{ value }
				</Badge>
			);
			break;
		}
		case 'success': {
			content = <Gridicon icon="checkmark" size={ 18 } className="sites-overview__grey-icon" />;
			break;
		}
		case 'disabled': {
			content = <Gridicon icon="minus-small" size={ 18 } className="sites-overview__icon-active" />;
			break;
		}
		case 'progress': {
			content = <Gridicon icon="time" size={ 18 } className="sites-overview__grey-icon" />;
			break;
		}
		case 'inactive': {
			content = ! isLicenseSelected ? (
				<button onClick={ handleSelectLicenseAction }>
					<span className="sites-overview__status-select-license">
						<Gridicon icon="plus-small" size={ 16 } />
						<span>{ translate( 'Add' ) }</span>
					</span>
				</button>
			) : (
				<button onClick={ handleDeselectLicenseAction }>
					<span className="sites-overview__status-unselect-license">
						<Gridicon icon="checkmark" size={ 16 } />
						<span>{ translate( 'Selected' ) }</span>
					</span>
				</button>
			);
			break;
		}
	}

	let updatedContent = content;

	if ( link ) {
		let target = '_self';
		let rel;
		if ( isExternalLink ) {
			target = '_blank';
			rel = 'noreferrer';
		}
		updatedContent = (
			<a
				data-testid={ `row-${ tooltipId }` }
				target={ target }
				rel={ rel }
				onClick={ handleClickRowAction }
				href={ link }
			>
				{ content }
			</a>
		);
	}

	if ( disabledStatus ) {
		updatedContent = <span className="sites-overview__disabled">{ content } </span>;
	}

	return (
		<>
			{ tooltip && ! disabledStatus ? (
				<>
					<span
						ref={ statusContentRef }
						onMouseEnter={ handleShowTooltip }
						onMouseLeave={ handleHideTooltip }
						className="sites-overview__row-status"
					>
						{ updatedContent }
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
				updatedContent
			) }
		</>
	);
}
