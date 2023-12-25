import {
	FEATURE_DONATIONS,
	FEATURE_PREMIUM_CONTENT_CONTAINER,
	FEATURE_RECURRING_PAYMENTS,
} from '@automattic/calypso-products';
import { CompactCard, Button, Badge, Gridicon } from '@automattic/components';
import { formatCurrency } from '@automattic/format-currency';
import { __, sprintf } from '@wordpress/i18n';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useState } from 'react';
import QueryMembershipsCoupons from 'calypso/components/data/query-memberships-coupons';
import QueryMembershipsSettings from 'calypso/components/data/query-memberships-settings';
import EllipsisMenu from 'calypso/components/ellipsis-menu';
import PopoverMenuItem from 'calypso/components/popover-menu/item';
import SectionHeader from 'calypso/components/section-header';
import { useSelector } from 'calypso/state';
import { getCouponsForSiteId } from 'calypso/state/memberships/coupon-list/selectors';
import { getConnectedAccountIdForSiteId } from 'calypso/state/memberships/settings/selectors';
import getFeaturesBySiteId from 'calypso/state/selectors/get-site-features';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import RecurringPaymentsCouponAddEditModal from '../components/add-edit-coupon-modal';
import { Coupon } from '../types';
import {
	ADD_NEW_COUPON_HASH,
	COUPON_DISCOUNT_TYPE_AMOUNT,
	COUPON_DISCOUNT_TYPE_PERCENTAGE,
} from './constants';

import './style.scss';

function CouponsList() {
	const translate = useTranslate();
	const [ showAddEditDialog, setShowAddEditDialog ] = useState( false );
	const [ , setShowDeleteDialog ] = useState( false );
	const [ coupon, setCoupon ] = useState< Product | null >( null );
	const site = useSelector( ( state ) => getSelectedSite( state ) );
	const features = useSelector( ( state ) => getFeaturesBySiteId( state, site?.ID ) );
	const hasLoadedFeatures = features?.active.length > 0;
	const coupons: Coupon[] = useSelector( ( state ) => getCouponsForSiteId( state, site?.ID ) );
	const connectedAccountId = useSelector( ( state ) =>
		getConnectedAccountIdForSiteId( state, site?.ID )
	);
	const hasDonationsFeature = useSelector( ( state ) =>
		siteHasFeature( state, site?.ID ?? null, FEATURE_DONATIONS )
	);
	const hasPremiumContentFeature = useSelector( ( state ) =>
		siteHasFeature( state, site?.ID ?? null, FEATURE_PREMIUM_CONTENT_CONTAINER )
	);
	const hasRecurringPaymentsFeature = useSelector( ( state ) =>
		siteHasFeature( state, site?.ID ?? null, FEATURE_RECURRING_PAYMENTS )
	);
	const hasStripeFeature =
		hasDonationsFeature || hasPremiumContentFeature || hasRecurringPaymentsFeature;

	function renderEllipsisMenu( couponId: number ) {
		return (
			<EllipsisMenu position="bottom left">
				{ hasStripeFeature && (
					<PopoverMenuItem onClick={ () => openAddEditDialog( couponId ) }>
						<Gridicon size={ 18 } icon="pencil" />
						{ translate( 'Edit' ) }
					</PopoverMenuItem>
				) }
				<PopoverMenuItem onClick={ () => openDeleteDialog( couponId ) }>
					<Gridicon size={ 18 } icon="trash" />
					{ translate( 'Delete' ) }
				</PopoverMenuItem>
			</EllipsisMenu>
		);
	}

	function openAddEditDialog( couponId?: number ) {
		if ( couponId ) {
			const currentCoupon = coupons.find( ( coup: Coupon ) => coup.ID === couponId );
			setShowAddEditDialog( true );
			setCoupon( currentCoupon ?? null );
		} else {
			setShowAddEditDialog( true );
			setCoupon( null );
		}
	}

	function openDeleteDialog( couponId: number ) {
		if ( couponId ) {
			const currentCoupon = coupons.find( ( coup: Coupon ) => coup.ID === couponId );
			setShowDeleteDialog( true );
			setCoupon( currentCoupon ?? null );
		}
	}

	function closeDialog() {
		setShowAddEditDialog( false );
		setShowDeleteDialog( false );
	}

	useEffect( () => {
		const showAddEditDialogInitially = window.location.hash === ADD_NEW_COUPON_HASH;

		if ( showAddEditDialogInitially ) {
			setShowAddEditDialog( true );
		}
	}, [] );

	return (
		<div className="memberships__products-list">
			<QueryMembershipsSettings siteId={ site?.ID ?? 0 } />
			<QueryMembershipsCoupons siteId={ site?.ID ?? 0 } />
			{ hasLoadedFeatures && hasStripeFeature && connectedAccountId && (
				<SectionHeader label={ translate( 'Manage coupons' ) }>
					<Button primary compact onClick={ () => openAddEditDialog() }>
						{ translate( 'Add a new coupon' ) }
					</Button>
				</SectionHeader>
			) }
			{ hasLoadedFeatures &&
				coupons.map( function ( currentCoupon: Coupon ) {
					return (
						<CompactCard className="memberships__products-product-card" key={ currentCoupon?.ID }>
							<div className="memberships__products-product-details">
								<div className="memberships__products-product-title">
									{ currentCoupon?.coupon_code }
								</div>
								<div className="memberships__products-product-description">
									{ currentCoupon?.description }
								</div>
								<sub className="memberships__products-product-price"></sub>
								{ currentCoupon?.end_date && (
									<div className="memberships__products-product-badge">
										<Badge type="info">
											{ translate( 'Expires on %s', { args: [ currentCoupon.end_date ] } ) }
										</Badge>
									</div>
								) }
								{ currentCoupon?.discount_type === COUPON_DISCOUNT_TYPE_PERCENTAGE && (
									<div className="memberships__products-product-badge">
										<Badge type="warning-clear">
											{ sprintf( __( '%s% off %s' ), [
												currentCoupon.discount_percentage,
												currentCoupon.duration,
											] ) }
										</Badge>
									</div>
								) }
								{ currentCoupon?.discount_type === COUPON_DISCOUNT_TYPE_AMOUNT && (
									<div className="memberships__products-product-badge">
										<Badge type="warning-clear">
											{ sprintf(
												__( '%s off %s' ),
												formatCurrency(
													currentCoupon.discount_value,
													currentCoupon.discount_currency
												),
												currentCoupon.duration
											) }
										</Badge>
									</div>
								) }
								{ ! currentCoupon?.can_be_combined && (
									<div className="memberships__products-product-badge">
										<Badge type="info-blue">
											{ translate( 'Cannot be combined with other coupons' ) }
										</Badge>
									</div>
								) }
								{ currentCoupon?.first_time_only && (
									<div className="memberships__products-product-badge">
										<Badge type="info-green">{ translate( 'First-time order only' ) }</Badge>
									</div>
								) }
								{ ! currentCoupon?.use_specific_emails && (
									<div className="memberships__products-product-badge">
										<Badge type="info-purple">{ translate( 'Limited to specific emails' ) }</Badge>
									</div>
								) }
							</div>
							{ currentCoupon && currentCoupon.ID && renderEllipsisMenu( currentCoupon.ID ) }
						</CompactCard>
					);
				} ) }
			{ hasLoadedFeatures && showAddEditDialog && hasStripeFeature && connectedAccountId && (
				<RecurringPaymentsCouponAddEditModal
					closeDialog={ closeDialog }
					coupon={ Object.assign( coupon ?? {}, {} ) }
				/>
			) }
		</div>
	);
}

export default CouponsList;
