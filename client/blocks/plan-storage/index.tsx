import {
	FEATURE_UNLIMITED_STORAGE,
	planHasFeature,
	isBusinessPlan,
	isEcommercePlan,
	isWooExpressMediumPlan,
	isProPlan,
} from '@automattic/calypso-products';
import { Tooltip } from '@automattic/components';
import { Site } from '@automattic/data-stores';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { PropsWithChildren, useRef, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { isPlansPageUntangled } from 'calypso/lib/plans/untangling-plans-experiment';
import { useStorageAddOnAvailable } from 'calypso/lib/plans/use-storage-add-on-available';
import { useStorageLimitOverride } from 'calypso/lib/plans/use-storage-limit-override';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { canCurrentUser } from 'calypso/state/selectors/can-current-user';
import hasWpcomStagingSite from 'calypso/state/selectors/has-wpcom-staging-site';
import isAtomicSite from 'calypso/state/selectors/is-site-automated-transfer';
import isSiteWpcomStaging from 'calypso/state/selectors/is-site-wpcom-staging';
import { getSitePlanSlug, getSiteSlug, isJetpackSite } from 'calypso/state/sites/selectors';
import PlanStorageBar from './bar';

import './style.scss';

export function useDisplayUpgradeLink( siteId: number | null ) {
	const isStagingSite = useSelector( ( state ) => isSiteWpcomStaging( state, siteId ) );
	const sitePlanSlug = useSelector( ( state ) => getSitePlanSlug( state, siteId ) ) ?? '';
	const canUserUpgrade = useSelector( ( state ) =>
		canCurrentUser( state, siteId, 'manage_options' )
	);

	const planHasTopStorageSpace =
		isBusinessPlan( sitePlanSlug ) ||
		isEcommercePlan( sitePlanSlug ) ||
		isProPlan( sitePlanSlug ) ||
		isWooExpressMediumPlan( sitePlanSlug );

	const isUntangled = useSelector( isPlansPageUntangled );
	const isStorageAddOnAvailable = useStorageAddOnAvailable( siteId );

	/**
	 * In the untangled plans experiment, users can purchase storage add-ons which is available for all plans from the modal.
	 * We don't want to show the upgrade link in this case.
	 */
	if ( isUntangled && isStorageAddOnAvailable ) {
		return false;
	}

	return canUserUpgrade && ! planHasTopStorageSpace && ! isStagingSite;
}

type StorageBarProps = PropsWithChildren< any >;

type PlanStorageProps = PropsWithChildren< {
	className?: string;
	hideWhenNoStorage?: boolean;
	siteId: number | null;
	storageBarComponent?: React.ComponentType< StorageBarProps > | React.FC< StorageBarProps >;
} >;

export default function PlanStorage( {
	children,
	className,
	hideWhenNoStorage = false,
	siteId,
	storageBarComponent: StorageBarComponent = PlanStorageBar,
}: PlanStorageProps ) {
	const jetpackSite = useSelector( ( state ) => isJetpackSite( state, siteId ) );
	const atomicSite = useSelector( ( state ) => isAtomicSite( state, siteId ) );
	const isStagingSite = useSelector( ( state ) => isSiteWpcomStaging( state, siteId ) );
	const hasStagingSite = useSelector( ( state ) => hasWpcomStagingSite( state, siteId ) );
	const sitePlanSlug = useSelector( ( state ) => getSitePlanSlug( state, siteId ) );
	const siteSlug = useSelector( ( state ) => getSiteSlug( state, siteId ) );
	const canViewBar = useSelector( ( state ) => canCurrentUser( state, siteId, 'publish_posts' ) );
	const translate = useTranslate();
	const { data: mediaStorage } = Site.useSiteMediaStorage( { siteIdOrSlug: siteId } );
	const [ isTooltipVisible, setTooltipVisible ] = useState( false );
	const displayUpgradeLink = useDisplayUpgradeLink( siteId );
	const tooltipAnchorRef = useRef( null );

	const dispatch = useDispatch();

	const maxStorageBytesOverride = useStorageLimitOverride( {
		currentStorageBytes: mediaStorage?.maxStorageBytes,
		siteId,
	} );
	if ( mediaStorage && maxStorageBytesOverride ) {
		mediaStorage.maxStorageBytes = maxStorageBytesOverride;
	}

	if ( ( jetpackSite && ! atomicSite ) || ! canViewBar || ! sitePlanSlug ) {
		return null;
	}

	if ( planHasFeature( sitePlanSlug, FEATURE_UNLIMITED_STORAGE ) ) {
		return null;
	}

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

	const showTooltip = () => {
		setTooltipVisible( true );
	};

	const hideTooltip = (
		event:
			| React.MouseEvent< HTMLDivElement | HTMLAnchorElement >
			| React.FocusEvent< HTMLDivElement | HTMLAnchorElement >
	) => {
		const relatedTarget = event.relatedTarget;

		// This checks if there is a blur event caused by the displaying of the tooltip.
		// We don't want to move focus in this case, so return the focus to the target element.
		if (
			event.type === 'blur' &&
			relatedTarget instanceof HTMLElement &&
			relatedTarget.closest( '.popover.tooltip.is-top' )
		) {
			event.stopPropagation();
			event.currentTarget.focus();
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
					onClick={ () => {
						dispatch( recordTracksEvent( 'calypso_hosting_overview_need_more_storage_click' ) );
					} }
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
