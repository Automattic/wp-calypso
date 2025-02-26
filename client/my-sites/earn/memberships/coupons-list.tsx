import {
	FEATURE_DONATIONS,
	FEATURE_PREMIUM_CONTENT_CONTAINER,
	FEATURE_RECURRING_PAYMENTS,
} from '@automattic/calypso-products';
import { CompactCard, Button, Badge, Gridicon } from '@automattic/components';
import { formatCurrency, useTranslate } from 'i18n-calypso';
import { useEffect, useState } from 'react';
import QueryMembershipsCoupons from 'calypso/components/data/query-memberships-coupons';
import QueryMembershipsSettings from 'calypso/components/data/query-memberships-settings';
import EllipsisMenu from 'calypso/components/ellipsis-menu';
import { LoadingEllipsis } from 'calypso/components/loading-ellipsis';
import PopoverMenuItem from 'calypso/components/popover-menu/item';
import SectionHeader from 'calypso/components/section-header';
import { useSelector } from 'calypso/state';
import { getCouponsForSiteId } from 'calypso/state/memberships/coupon-list/selectors';
import {
	getCouponsAndGiftsEnabledForSiteId,
	getIsConnectedForSiteId,
} from 'calypso/state/memberships/settings/selectors';
import getFeaturesBySiteId from 'calypso/state/selectors/get-site-features';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import RecurringPaymentsCouponAddEditModal from '../components/add-edit-coupon-modal';
import { Coupon, Product } from '../types';
import {
	ADD_NEW_COUPON_HASH,
	COUPON_DISCOUNT_TYPE_AMOUNT,
	COUPON_DISCOUNT_TYPE_PERCENTAGE,
	COUPON_DURATION_1_MONTH,
	COUPON_DURATION_1_YEAR,
	COUPON_DURATION_3_MONTHS,
	COUPON_DURATION_6_MONTHS,
	COUPON_DURATION_FOREVER,
} from './constants';
import './style.scss';
import RecurringPaymentsCouponDeleteModal from './delete-coupon-modal';

function CouponsList() {
	const translate = useTranslate();
	const [ showAddEditDialog, setShowAddEditDialog ] = useState( false );
	const [ showDeleteDialog, setShowDeleteDialog ] = useState( false );
	const [ coupon, setCoupon ] = useState< Product | null >( null );
	const site = useSelector( getSelectedSite );
	const features = useSelector( ( state ) => getFeaturesBySiteId( state, site?.ID ) );
	const hasLoadedFeatures = features?.active.length > 0;
	const coupons: Coupon[] = useSelector( ( state ) => getCouponsForSiteId( state, site?.ID ) );
	const couponsAndGiftsEnabled = useSelector( ( state ) =>
		getCouponsAndGiftsEnabledForSiteId( state, site?.ID )
	);
	const hasConnectedAccount = useSelector( ( state ) =>
		getIsConnectedForSiteId( state, site?.ID )
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

	function getDiscountBadge(
		duration: string,
		amountType: string,
		amount: number,
		currencyCode: string = 'USD'
	) {
		const formattedAmount =
			COUPON_DISCOUNT_TYPE_PERCENTAGE === amountType
				? amount + '%'
				: formatCurrency( amount, currencyCode );
		switch ( duration ) {
			case COUPON_DURATION_1_MONTH:
				return translate( '%s off for 1 month', {
					args: [ formattedAmount ],
				} );
			case COUPON_DURATION_3_MONTHS:
				return translate( '%s off for 3 months', {
					args: [ formattedAmount ],
				} );
			case COUPON_DURATION_6_MONTHS:
				return translate( '%s off for 6 months', {
					args: [ formattedAmount ],
				} );
			case COUPON_DURATION_1_YEAR:
				return translate( '%s off for 1 year', {
					args: [ formattedAmount ],
				} );
			case COUPON_DURATION_FOREVER:
				return translate( '%s off forever', {
					args: [ formattedAmount ],
				} );
		}
	}

	useEffect( () => {
		const showAddEditDialogInitially = window.location.hash === ADD_NEW_COUPON_HASH;

		if ( showAddEditDialogInitially ) {
			setShowAddEditDialog( true );
		}
	}, [] );

	return (
		couponsAndGiftsEnabled && (
			<div className="memberships__products-list">
				<QueryMembershipsSettings siteId={ site?.ID ?? 0 } />
				<QueryMembershipsCoupons siteId={ site?.ID ?? 0 } />
				{ hasLoadedFeatures && hasStripeFeature && hasConnectedAccount && (
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
									<sub className="memberships__products-product-amount"></sub>
									{ currentCoupon?.end_date && (
										<div className="memberships__coupons-coupon-badge">
											<Badge type="info">
												{ translate( 'Expires on %s', { args: [ currentCoupon.end_date ] } ) }
											</Badge>
										</div>
									) }
									{ currentCoupon?.discount_type === COUPON_DISCOUNT_TYPE_PERCENTAGE && (
										<div className="memberships__coupons-coupon-badge">
											<Badge type="info">
												{ getDiscountBadge(
													currentCoupon?.duration || '',
													currentCoupon?.discount_type,
													currentCoupon?.discount_percentage || 0
												) }
											</Badge>
										</div>
									) }
									{ currentCoupon?.discount_type === COUPON_DISCOUNT_TYPE_AMOUNT && (
										<div className="memberships__coupons-coupon-badge">
											<Badge type="info">
												{ getDiscountBadge(
													currentCoupon?.duration || '',
													currentCoupon?.discount_type,
													currentCoupon?.discount_value || 0,
													currentCoupon?.discount_currency || 'USD'
												) }
											</Badge>
										</div>
									) }
									{ currentCoupon?.cannot_be_combined && (
										<div className="memberships__coupons-coupon-badge">
											<Badge type="info">
												{ translate( 'Cannot be combined with other coupons' ) }
											</Badge>
										</div>
									) }
									{ currentCoupon?.first_time_purchase_only && (
										<div className="memberships__coupons-coupon-badge">
											<Badge type="info">{ translate( 'First-time order only' ) }</Badge>
										</div>
									) }
									{ ( currentCoupon?.email_allow_list?.length ?? 0 ) > 0 && (
										<div className="memberships__coupons-coupon-badge">
											<Badge type="info">{ translate( 'Limited to specific emails' ) }</Badge>
										</div>
									) }
									{ ( currentCoupon?.plan_ids_allow_list?.length ?? 0 ) > 0 && (
										<div className="memberships__coupons-coupon-badge">
											<Badge type="info">{ translate( 'Limited to specific products' ) }</Badge>
										</div>
									) }
								</div>
								{ currentCoupon && currentCoupon.ID && renderEllipsisMenu( currentCoupon.ID ) }
							</CompactCard>
						);
					} ) }
				{ hasLoadedFeatures && showAddEditDialog && hasStripeFeature && hasConnectedAccount && (
					<RecurringPaymentsCouponAddEditModal
						closeDialog={ closeDialog }
						coupon={ Object.assign( coupon ?? {}, {} ) }
					/>
				) }
				{ hasLoadedFeatures && showDeleteDialog && coupon && (
					<RecurringPaymentsCouponDeleteModal closeDialog={ closeDialog } coupon={ coupon } />
				) }
				{ ! hasLoadedFeatures && (
					<div className="memberships__loading">
						<LoadingEllipsis />
					</div>
				) }
			</div>
		)
	);
}

export default CouponsList;
