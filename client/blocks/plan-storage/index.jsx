import {
	FEATURE_UNLIMITED_STORAGE,
	planHasFeature,
	isBusinessPlan,
	isEcommercePlan,
	PLAN_FREE,
	PLAN_WPCOM_PRO,
	PLAN_WPCOM_FLEXIBLE,
	PLAN_WPCOM_STARTER,
	isProPlan,
} from '@automattic/calypso-products';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import useMediaStorageQuery from 'calypso/data/media-storage/use-media-storage-query';
import { canCurrentUser } from 'calypso/state/selectors/can-current-user';
import isLegacySiteWithHigherLimits from 'calypso/state/selectors/is-legacy-site-with-higher-limits';
import isAtomicSite from 'calypso/state/selectors/is-site-automated-transfer';
import { getSitePlanSlug, getSiteSlug, isJetpackSite } from 'calypso/state/sites/selectors';
import PlanStorageBar from './bar';
import Tooltip from './tooltip';

import './style.scss';

export function PlanStorage( { children, className, siteId } ) {
	const jetpackSite = useSelector( ( state ) => isJetpackSite( state, siteId ) );
	const atomicSite = useSelector( ( state ) => isAtomicSite( state, siteId ) );
	const sitePlanSlug = useSelector( ( state ) => getSitePlanSlug( state, siteId ) );
	const siteSlug = useSelector( ( state ) => getSiteSlug( state, siteId ) );
	const canUserUpgrade = useSelector( ( state ) =>
		canCurrentUser( state, siteId, 'manage_options' )
	);
	const canViewBar = useSelector( ( state ) => canCurrentUser( state, siteId, 'publish_posts' ) );
	const translate = useTranslate();
	const { data: mediaStorage } = useMediaStorageQuery( siteId );
	const legacySiteWithHigherLimits = useSelector( ( state ) =>
		isLegacySiteWithHigherLimits( state, siteId )
	);

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
			mediaStorage.max_storage_bytes === 3072 * 1024 * 1024
		) {
			mediaStorage.max_storage_bytes = 1024 * 1024 * 1024;
		}

		if ( sitePlanSlug === PLAN_WPCOM_PRO ) {
			mediaStorage.max_storage_bytes = 50 * 1024 * 1024 * 1024;
		}

		if ( sitePlanSlug === PLAN_WPCOM_STARTER ) {
			mediaStorage.max_storage_bytes = 6 * 1024 * 1024 * 1024;
		}
	}

	const planHasTopStorageSpace =
		isBusinessPlan( sitePlanSlug ) || isEcommercePlan( sitePlanSlug ) || isProPlan( sitePlanSlug );

	const displayUpgradeLink = canUserUpgrade && ! planHasTopStorageSpace;

	const planStorageComponents = (
		<>
			<PlanStorageBar
				sitePlanSlug={ sitePlanSlug }
				mediaStorage={ mediaStorage }
				displayUpgradeLink={ displayUpgradeLink }
			>
				{ children }
			</PlanStorageBar>
		</>
	);

	if ( displayUpgradeLink ) {
		return (
			<Tooltip
				title={ translate( 'Upgrade your plan to increase your storage space.' ) }
				className="plan-storage__tooltip"
			>
				<a className={ classNames( className, 'plan-storage' ) } href={ `/plans/${ siteSlug }` }>
					{ planStorageComponents }
				</a>
			</Tooltip>
		);
	}
	return <div className={ classNames( className, 'plan-storage' ) }>{ planStorageComponents }</div>;
}

PlanStorage.propTypes = {
	className: PropTypes.string,
	siteId: PropTypes.number,
};

export default PlanStorage;
