import {
	FEATURE_UNLIMITED_STORAGE,
	planHasFeature,
	isBusinessPlan,
	isEcommercePlan,
	isWooExpressMediumPlan,
	PLAN_FREE,
	PLAN_WPCOM_PRO,
	PLAN_WPCOM_FLEXIBLE,
	PLAN_WPCOM_STARTER,
	isProPlan,
} from '@automattic/calypso-products';
import { Tooltip } from '@automattic/components';
import { Site } from '@automattic/data-stores';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { ComponentType, FC, PropsWithChildren, ReactNode, useRef, useState } from 'react'; // eslint-disable-line no-unused-vars -- used in the jsdoc types
import { useSelector } from 'react-redux';
import { canCurrentUser } from 'calypso/state/selectors/can-current-user';
import hasWpcomStagingSite from 'calypso/state/selectors/has-wpcom-staging-site';
import isLegacySiteWithHigherLimits from 'calypso/state/selectors/is-legacy-site-with-higher-limits';
import isAtomicSite from 'calypso/state/selectors/is-site-automated-transfer';
import isSiteWpcomStaging from 'calypso/state/selectors/is-site-wpcom-staging';
import { getSitePlanSlug, getSiteSlug, isJetpackSite } from 'calypso/state/sites/selectors';
import PlanStorageBar from './bar';

import './style.scss';

/**
 * @typedef {Object} Props
 * @property {ReactNode} children - The children to render inside the storage bar.
 * @property {string} [className] - Additional class names to apply to the component.
 * @property {boolean} [hideWhenNoStorage] - Whether to return null when there is no storage data.
 * @property {number|null} [siteId] - The site ID.
 * @property {ComponentType|FC<PropsWithChildren<any>>} [StorageBarComponent] - The component to use for the storage bar.
 */

/**
 * @param {Props} props
 */
export function PlanStorage( {
	children,
	className,
	hideWhenNoStorage = false,
	siteId,
	StorageBarComponent = PlanStorageBar,
} ) {
	const jetpackSite = useSelector( ( state ) => isJetpackSite( state, siteId ) );
	const atomicSite = useSelector( ( state ) => isAtomicSite( state, siteId ) );
	const isStagingSite = useSelector( ( state ) => isSiteWpcomStaging( state, siteId ) );
	const hasStagingSite = useSelector( ( state ) => hasWpcomStagingSite( state, siteId ) );
	const sitePlanSlug = useSelector( ( state ) => getSitePlanSlug( state, siteId ) );
	const siteSlug = useSelector( ( state ) => getSiteSlug( state, siteId ) );
	const canUserUpgrade = useSelector( ( state ) =>
		canCurrentUser( state, siteId, 'manage_options' )
	);
	const canViewBar = useSelector( ( state ) => canCurrentUser( state, siteId, 'publish_posts' ) );
	const translate = useTranslate();
	const { data: mediaStorage } = Site.useSiteMediaStorage( { siteIdOrSlug: siteId } );
	const legacySiteWithHigherLimits = useSelector( ( state ) =>
		isLegacySiteWithHigherLimits( state, siteId )
	);
	const [ isTooltipVisible, setTooltipVisible ] = useState( false );
	const tooltipAnchorRef = useRef( null );

	if ( ( jetpackSite && ! atomicSite ) || ! canViewBar || ! sitePlanSlug ) {
		return null;
	}

	if ( planHasFeature( sitePlanSlug, FEATURE_UNLIMITED_STORAGE ) ) {
		return null;
	}

	if ( mediaStorage ) {
		// Only override the storage for non-legacy sites that are on a free
		// plan. Even if the site is on a free plan, it could have a space
		// upgrade product on top of that, so also check that it is using the
		// default free space before overriding it (that is somewhat fragile,
		// but this code is expected to be temporary anyway).
		if (
			( sitePlanSlug === PLAN_FREE || sitePlanSlug === PLAN_WPCOM_FLEXIBLE ) &&
			! legacySiteWithHigherLimits &&
			mediaStorage.maxStorageBytes === 3072 * 1024 * 1024
		) {
			mediaStorage.maxStorageBytes = 1024 * 1024 * 1024;
		}

		if ( sitePlanSlug === PLAN_WPCOM_PRO ) {
			mediaStorage.maxStorageBytes = 50 * 1024 * 1024 * 1024;
		}

		if ( sitePlanSlug === PLAN_WPCOM_STARTER ) {
			mediaStorage.maxStorageBytes = 6 * 1024 * 1024 * 1024;
		}
	}

	const planHasTopStorageSpace =
		isBusinessPlan( sitePlanSlug ) ||
		isEcommercePlan( sitePlanSlug ) ||
		isProPlan( sitePlanSlug ) ||
		isWooExpressMediumPlan( sitePlanSlug );

	const displayUpgradeLink = canUserUpgrade && ! planHasTopStorageSpace && ! isStagingSite;
	const isSharedQuota = isStagingSite || hasStagingSite;

	const hasMediaStorage = !! mediaStorage && mediaStorage.maxStorageBytes !== -1;
	if ( hideWhenNoStorage && ! hasMediaStorage ) {
		return null;
	}

	const planStorageComponents = (
		<StorageBarComponent
			sitePlanSlug={ sitePlanSlug }
			mediaStorage={ mediaStorage }
			displayUpgradeLink={ displayUpgradeLink }
		>
			{ children }
		</StorageBarComponent>
	);

	const showTooltip = () => setTooltipVisible( true );
	const hideTooltip = ( event ) => {
		const relatedTarget = event?.relatedTarget;
		// This checks if there is a blur event caused by the displaying of the tooltip.
		// We don't want to move focus in this case, so return the focus to the target element.
		if ( event?.type === 'blur' && relatedTarget?.closest?.( '.popover.tooltip.is-top' ) ) {
			event.stopPropagation();
			event.target.focus();
			return;
		}
		setTooltipVisible( false );
	};

	if ( displayUpgradeLink ) {
		return (
			<>
				<a
					className={ clsx( className, 'plan-storage' ) }
					href={ `/plans/${ siteSlug }` }
					ref={ tooltipAnchorRef }
					onMouseOver={ showTooltip }
					onMouseLeave={ hideTooltip }
					onFocus={ showTooltip }
					onBlur={ hideTooltip }
				>
					{ planStorageComponents }
				</a>
				<Tooltip context={ tooltipAnchorRef.current } isVisible={ isTooltipVisible }>
					{ translate( 'Upgrade your plan to increase your storage space.' ) }
				</Tooltip>
			</>
		);
	}

	if ( isSharedQuota ) {
		return (
			<>
				<div
					className={ clsx( className, 'plan-storage plan-storage__shared_quota' ) }
					ref={ tooltipAnchorRef }
					onMouseOver={ showTooltip }
					onMouseLeave={ hideTooltip }
					onFocus={ showTooltip }
					onBlur={ hideTooltip }
				>
					{ planStorageComponents }
				</div>
				<Tooltip context={ tooltipAnchorRef.current } isVisible={ isTooltipVisible }>
					{ translate( 'Storage quota is shared between production and staging.' ) }
				</Tooltip>
			</>
		);
	}

	return <div className={ clsx( className, 'plan-storage' ) }>{ planStorageComponents }</div>;
}

PlanStorage.propTypes = {
	className: PropTypes.string,
	siteId: PropTypes.number,
};

export default PlanStorage;
