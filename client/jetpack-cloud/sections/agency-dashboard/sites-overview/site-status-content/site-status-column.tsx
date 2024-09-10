import { isEnabled } from '@automattic/calypso-config';
import page from '@automattic/calypso-router';
import { Gridicon, Tooltip } from '@automattic/components';
import { addQueryArgs } from '@wordpress/url';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useMemo, useRef, useState } from 'react';
import {
	A4A_MARKETPLACE_CHECKOUT_LINK,
	A4A_UNASSIGNED_LICENSES_LINK,
} from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import useFetchLicenses from 'calypso/a8c-for-agencies/data/purchases/use-fetch-licenses';
import { checkLicenseKeyForFeature } from 'calypso/components/jetpack/unassigned-license-notice/lib/check-license-key-for-feature';
import {
	LicenseFilter,
	LicenseSortDirection,
	LicenseSortField,
} from 'calypso/jetpack-cloud/sections/partner-portal/types';
import isA8CForAgencies from 'calypso/lib/a8c-for-agencies/is-a8c-for-agencies';
import { useDispatch, useSelector } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { selectLicense, unselectLicense } from 'calypso/state/jetpack-agency-dashboard/actions';
import {
	hasSelectedLicensesOfType,
	hasSelectedSiteLicensesOfType,
} from 'calypso/state/jetpack-agency-dashboard/selectors';
import { getCurrentPartner } from 'calypso/state/partner-portal/partner/selectors';
import { DASHBOARD_PRODUCT_SLUGS_BY_TYPE, FEATURE_TYPES_BY_TYPE } from '../lib/constants';
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

	if ( rows.site.value.sticker?.includes( 'migration-in-progress' ) ) {
		disabled = true;
	}

	const dispatch = useDispatch();
	const translate = useTranslate();

	const { data } = useFetchLicenses(
		LicenseFilter.Detached,
		'',
		LicenseSortField.IssuedAt,
		LicenseSortDirection.Descending,
		1
	);

	const siteId = rows.site.value.blog_id;

	const isStreamlinedPurchasesEnabled = isEnabled( 'jetpack/streamline-license-purchases' );

	const isLicenseSelected = useSelector( ( state ) =>
		isStreamlinedPurchasesEnabled
			? hasSelectedSiteLicensesOfType( state, siteId, type )
			: hasSelectedLicensesOfType( state, siteId, type )
	);

	const isA4AEnabled = isA8CForAgencies();
	const partner = useSelector( getCurrentPartner );
	const partnerCanIssueLicense = Boolean( partner?.can_issue_licenses );

	const issueLicenseRedirectUrl = useMemo( () => {
		return addQueryArgs( `/partner-portal/issue-license/`, {
			site_id: siteId,
			product_slug: DASHBOARD_PRODUCT_SLUGS_BY_TYPE[ type ],
			source: 'dashboard',
		} );
	}, [ siteId, type ] );

	const handleA4AAddAction = useCallback( () => {
		const productSlug = DASHBOARD_PRODUCT_SLUGS_BY_TYPE[ type ];
		let productPurchaseLink = `${ A4A_MARKETPLACE_CHECKOUT_LINK }?product_slug=${ productSlug }&source=sitesdashboard&site_id=${ siteId }`;
		const licenses = data?.items ?? [];
		const featureType = FEATURE_TYPES_BY_TYPE[ type ];
		if ( featureType ) {
			for ( const l in licenses ) {
				const hasFeature = checkLicenseKeyForFeature( featureType, licenses[ l ].licenseKey );
				if ( hasFeature ) {
					productPurchaseLink = A4A_UNASSIGNED_LICENSES_LINK;
					break;
				}
			}
		}
		return page( productPurchaseLink );
	}, [ data?.items, siteId, type ] );

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
				if ( isA4AEnabled ) {
					return (
						<button className="sites-overview__column-action-button" onClick={ handleA4AAddAction }>
							<Gridicon icon="plus-small" size={ 16 } />
							<span>{ translate( 'Add' ) }</span>
						</button>
					);
				}
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
		isSupported,
		status,
		value,
		isA4AEnabled,
		partnerCanIssueLicense,
		isLicenseSelected,
		handleSelectLicenseAction,
		translate,
		handleDeselectLicenseAction,
		handleA4AAddAction,
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
