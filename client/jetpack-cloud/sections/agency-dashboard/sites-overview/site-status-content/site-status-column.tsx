import { isEnabled } from '@automattic/calypso-config';
import page from '@automattic/calypso-router';
import { Gridicon, Tooltip } from '@automattic/components';
import { addQueryArgs } from '@wordpress/url';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { selectLicense, unselectLicense } from 'calypso/state/jetpack-agency-dashboard/actions';
import {
	hasSelectedLicensesOfType,
	hasSelectedSiteLicensesOfType,
} from 'calypso/state/jetpack-agency-dashboard/selectors';
import { getCurrentPartner } from 'calypso/state/partner-portal/partner/selectors';
import { DASHBOARD_PRODUCT_SLUGS_BY_TYPE } from '../lib/constants';
import { AllowedTypes, RowMetaData, SiteData } from '../types';

type Props = {
	type: AllowedTypes;
	rows: SiteData;
	metadata: RowMetaData;
	disabled?: boolean;
};

export default function SiteStatusColumn( { type, rows, metadata, disabled }: Props ) {
	const {
		link,
		isExternalLink,
		tooltipId,
		eventName,
		row: { value, status },
		tooltip,
		isSupported,
	} = metadata;

	const dispatch = useDispatch();
	const translate = useTranslate();

	const siteId = rows.site.value.blog_id;

	const isStreamlinedPurchasesEnabled = isEnabled( 'jetpack/streamline-license-purchases' );

	const isLicenseSelected = useSelector( ( state ) =>
		isStreamlinedPurchasesEnabled
			? hasSelectedSiteLicensesOfType( state, siteId, type )
			: hasSelectedLicensesOfType( state, siteId, type )
	);

	const partner = useSelector( getCurrentPartner );
	const partnerCanIssueLicense =
		isEnabled( 'a8c-for-agencies' ) || Boolean( partner?.can_issue_licenses ); // FIXME: get this from state when isEnabled( 'a8c-for-agencies' )

	const issueLicenseRedirectUrl = useMemo( () => {
		return addQueryArgs( `/partner-portal/issue-license/`, {
			site_id: siteId,
			product_slug: DASHBOARD_PRODUCT_SLUGS_BY_TYPE[ type ],
			source: 'dashboard',
		} );
	}, [ siteId, type ] );

	const handleSelectLicenseAction = useCallback( () => {
		if ( isStreamlinedPurchasesEnabled ) {
			dispatch( selectLicense( siteId, type ) );
			return;
		}
		const inactiveProducts = Object.values( rows ).filter( ( row ) => row?.status === 'inactive' );
		if ( inactiveProducts.length > 1 ) {
			return dispatch( selectLicense( siteId, type ) );
		}
		// Redirect to issue-license if there is only one inactive product available for a site
		return page( issueLicenseRedirectUrl );
	}, [ dispatch, isStreamlinedPurchasesEnabled, issueLicenseRedirectUrl, rows, siteId, type ] );

	const handleDeselectLicenseAction = useCallback( () => {
		dispatch( unselectLicense( siteId, type ) );
	}, [ dispatch, siteId, type ] );

	const handleClickRowAction = useCallback( () => {
		dispatch( recordTracksEvent( eventName ) );
	}, [ dispatch, eventName ] );

	const statusContentRef = useRef< HTMLSpanElement | null >( null );
	const [ showTooltip, setShowTooltip ] = useState( false );

	const handleShowTooltip = () => {
		setShowTooltip( true );
	};
	const handleHideTooltip = () => {
		setShowTooltip( false );
	};

	const content = useMemo( () => {
		if ( ! isSupported ) {
			return <Gridicon icon="minus-small" size={ 18 } className="sites-overview__icon-active" />;
		}

		switch ( status ) {
			case 'critical': {
				return <div className="sites-overview__critical">{ value as string }</div>;
			}
			case 'failed': {
				return <div className="sites-overview__failed">{ value as string }</div>;
			}
			case 'warning': {
				return <div className="sites-overview__warning">{ value as string }</div>;
			}
			case 'success': {
				return <Gridicon icon="checkmark" size={ 18 } className="sites-overview__grey-icon" />;
			}
			case 'disabled': {
				return <Gridicon icon="minus-small" size={ 18 } className="sites-overview__icon-active" />;
			}
			case 'progress': {
				return <Gridicon icon="time" size={ 18 } className="sites-overview__grey-icon" />;
			}
			case 'inactive': {
				if ( ! partnerCanIssueLicense ) {
					return null;
				}
				return ! isLicenseSelected ? (
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
			}
		}
	}, [
		handleDeselectLicenseAction,
		handleSelectLicenseAction,
		partnerCanIssueLicense,
		isLicenseSelected,
		isSupported,
		status,
		translate,
		value,
	] );

	let wrappedContent = content;

	if ( link ) {
		wrappedContent = (
			<a
				data-testid={ `row-${ tooltipId }` }
				target={ isExternalLink ? '_blank' : undefined }
				rel={ isExternalLink ? 'noreferrer' : undefined }
				onClick={ handleClickRowAction }
				href={ link }
			>
				{ content }
			</a>
		);
	}

	if ( disabled ) {
		wrappedContent = (
			<span className="sites-overview__disabled sites-overview__row-status">{ content }</span>
		);
	}

	if ( tooltip && ! disabled ) {
		return (
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
					{ wrappedContent }
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
		);
	}

	return <span className="sites-overview__row-status">{ wrappedContent }</span>;
}
