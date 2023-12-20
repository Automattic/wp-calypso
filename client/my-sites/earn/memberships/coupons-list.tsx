import {
	FEATURE_DONATIONS,
	FEATURE_PREMIUM_CONTENT_CONTAINER,
	FEATURE_RECURRING_PAYMENTS,
} from '@automattic/calypso-products';
import { CompactCard, Button } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useState } from 'react';
import QueryMembershipsCoupons from 'calypso/components/data/query-memberships-coupons';
import QueryMembershipsSettings from 'calypso/components/data/query-memberships-settings';
import SectionHeader from 'calypso/components/section-header';
import { useSelector } from 'calypso/state';
import { getCouponsForSiteId } from 'calypso/state/memberships/coupon-list/selectors';
import { getConnectedAccountIdForSiteId } from 'calypso/state/memberships/settings/selectors';
import getFeaturesBySiteId from 'calypso/state/selectors/get-site-features';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import RecurringPaymentsCouponAddEditModal from '../components/add-edit-coupon-modal';
import { Coupon } from '../types';
import { ADD_NEW_COUPON_HASH } from './constants';

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

	/*
	function openDeleteDialog( couponId: number ) {
		if ( couponId ) {
			const currentCoupon = coupons.find( ( coup: Coupon ) => coup.ID === couponId );
			setShowDeleteDialog( true );
			setCoupon( currentCoupon ?? null );
		}
	}
	*/

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
								<sub className="memberships__products-product-price"></sub>
							</div>
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
