import { Gridicon } from '@automattic/components';
import { addQueryArgs } from '@wordpress/url';
import { translate } from 'i18n-calypso';
import page from 'page';
import { useRef, useState, useMemo } from 'react';
import Tooltip from 'calypso/components/tooltip';
import { useDispatch, useSelector } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { selectLicense, unselectLicense } from 'calypso/state/jetpack-agency-dashboard/actions';
import { hasSelectedLicensesOfType } from 'calypso/state/jetpack-agency-dashboard/selectors';
import { isJetpackSiteMultiSite } from 'calypso/state/sites/selectors';
import ToggleActivateMonitoring from '../../downtime-monitoring/toggle-activate-monitoring';
import { DASHBOARD_PRODUCT_SLUGS_BY_TYPE } from '../lib/constants';
import useRowMetadata from './hooks/use-row-metadata';
import SiteBoostColumn from './site-boost-column';
import SiteNameColumn from './site-name-column';
import SiteStatsColumn from './site-stats-column';
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
	const dispatch = useDispatch();

	const {
		link,
		isExternalLink,
		row: { value, status },
		tooltipId,
		siteDown,
		eventName,
		...metadataRest
	} = useRowMetadata( rows, type, isLargeScreen );

	let { tooltip } = metadataRest;

	const siteId = rows.site.value.blog_id;

	const isLicenseSelected = useSelector( ( state ) =>
		hasSelectedLicensesOfType( state, siteId, type )
	);

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

	const handleClickRowAction = () => {
		dispatch( recordTracksEvent( eventName ) );
	};

	const issueLicenseRedirectUrl = useMemo( () => {
		return addQueryArgs( `/partner-portal/issue-license/`, {
			site_id: siteId,
			product_slug: DASHBOARD_PRODUCT_SLUGS_BY_TYPE[ type ],
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

		switch ( status ) {
			case 'critical': {
				// We know value is a string because we've handled the other types of non-string values above.
				content = <div className="sites-overview__critical">{ value as string }</div>;
				break;
			}
			case 'failed': {
				content = <div className="sites-overview__failed">{ value as string }</div>;
				break;
			}
			case 'warning': {
				content = <div className="sites-overview__warning">{ value as string }</div>;
				break;
			}
			case 'success': {
				content = <Gridicon icon="checkmark" size={ 18 } className="sites-overview__grey-icon" />;
				break;
			}
			case 'disabled': {
				content = (
					<Gridicon icon="minus-small" size={ 18 } className="sites-overview__icon-active" />
				);
				break;
			}
			case 'progress': {
				content = <Gridicon icon="time" size={ 18 } className="sites-overview__grey-icon" />;
				break;
			}
			case 'inactive': {
				content = ! isLicenseSelected ? (
					<button
						className="sites-overview__column-action-button"
						onClick={ handleSelectLicenseAction }
					>
						<Gridicon icon="plus-small" size={ 16 } />
						<span>{ translate( 'Add' ) }</span>
					</button>
				) : (
					<button
						className="sites-overview__column-action-button is-selected"
						onClick={ handleDeselectLicenseAction }
					>
						<Gridicon icon="checkmark" size={ 16 } />
						<span>{ translate( 'Selected' ) }</span>
					</button>
				);
				break;
			}
		}
	}

	let updatedContent = content;

	if ( ! showMultisiteNotSupported ) {
		if ( link ) {
			let target = undefined;
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
			updatedContent = (
				<span className="sites-overview__disabled sites-overview__row-status">{ content } </span>
			);
		}
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
				<span className="sites-overview__row-status">{ updatedContent }</span>
			) }
		</>
	);
}
