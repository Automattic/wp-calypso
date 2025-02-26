import {
	FEATURE_DONATIONS,
	FEATURE_PREMIUM_CONTENT_CONTAINER,
	FEATURE_RECURRING_PAYMENTS,
} from '@automattic/calypso-products';
import { Badge, Button, Card, CompactCard, Gridicon } from '@automattic/components';
import { formatCurrency, useTranslate } from 'i18n-calypso';
import { useEffect, useState } from 'react';
import UpsellNudge from 'calypso/blocks/upsell-nudge';
import QueryMembershipProducts from 'calypso/components/data/query-memberships';
import QueryMembershipsSettings from 'calypso/components/data/query-memberships-settings';
import EllipsisMenu from 'calypso/components/ellipsis-menu';
import { LoadingEllipsis } from 'calypso/components/loading-ellipsis';
import PopoverMenuItem from 'calypso/components/popover-menu/item';
import SectionHeader from 'calypso/components/section-header';
import { useDispatch, useSelector } from 'calypso/state';
import { bumpStat, recordTracksEvent } from 'calypso/state/analytics/actions';
import { getProductsForSiteId } from 'calypso/state/memberships/product-list/selectors';
import getFeaturesBySiteId from 'calypso/state/selectors/get-site-features';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import RecurringPaymentsPlanAddEditModal from '../components/add-edit-plan-modal';
import { Product } from '../types';
import {
	ADD_NEW_PAYMENT_PLAN_HASH,
	ADD_TIER_PLAN_HASH,
	OLD_ADD_NEWSLETTER_PAYMENT_PLAN_HASH,
	PLAN_MONTHLY_FREQUENCY,
	PLAN_ONE_TIME_FREQUENCY,
	PLAN_YEARLY_FREQUENCY,
	TYPE_TIER,
} from './constants';
import RecurringPaymentsPlanDeleteModal from './delete-plan-modal';
import './style.scss';

function ProductsList() {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const [ showAddEditDialog, setShowAddEditDialog ] = useState( false );
	const [ showDeleteDialog, setShowDeleteDialog ] = useState( false );
	const [ product, setProduct ] = useState< Product | null >( null );
	const [ annualProduct, setAnnualProduct ] = useState< Product | null >( null );
	const site = useSelector( getSelectedSite );
	const features = useSelector( ( state ) => getFeaturesBySiteId( state, site?.ID ) );
	const hasLoadedFeatures = features?.active.length > 0;
	const products: Product[] = useSelector( ( state ) => getProductsForSiteId( state, site?.ID ) );
	const hasProducts = products.length > 0;

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

	const defaultToTierPanel =
		window.location.hash === OLD_ADD_NEWSLETTER_PAYMENT_PLAN_HASH ||
		window.location.hash === ADD_TIER_PLAN_HASH;
	const default_product_type = defaultToTierPanel ? TYPE_TIER : null;

	const trackUpgrade = () =>
		dispatch( bumpStat( 'calypso_earn_page', 'payment-plans-upgrade-button' ) );

	function renderEllipsisMenu( productId: number ) {
		return (
			<EllipsisMenu position="bottom left">
				{ hasStripeFeature && (
					<PopoverMenuItem onClick={ () => openAddEditDialog( productId ) }>
						<Gridicon size={ 18 } icon="pencil" />
						{ translate( 'Edit' ) }
					</PopoverMenuItem>
				) }
				<PopoverMenuItem onClick={ () => openDeleteDialog( productId ) }>
					<Gridicon size={ 18 } icon="trash" />
					{ translate( 'Delete' ) }
				</PopoverMenuItem>
			</EllipsisMenu>
		);
	}

	function onAddNewPaymentPlanButtonClick() {
		dispatch( recordTracksEvent( 'calypso_memberships_add_payment_plan_click' ) );
		openAddEditDialog();
	}

	function openAddEditDialog( productId?: number ) {
		if ( productId ) {
			const currentProduct = products.find( ( prod: Product ) => prod.ID === productId );
			const currentAnnualProduct = products.find( ( prod: Product ) => prod.tier === productId );
			setShowAddEditDialog( true );
			setProduct( currentProduct ?? null );
			setAnnualProduct( currentAnnualProduct ?? null );
		} else {
			setShowAddEditDialog( true );
			setProduct( null );
			setAnnualProduct( null );
		}
	}

	function openDeleteDialog( productId: number ) {
		if ( productId ) {
			const currentProduct = products.find( ( prod: Product ) => prod.ID === productId );
			const currentAnnualProduct = products.find( ( prod: Product ) => prod.tier === productId );
			setShowDeleteDialog( true );
			setProduct( currentProduct ?? null );
			setAnnualProduct( currentAnnualProduct ?? null );
		}
	}

	function closeDialog() {
		setShowAddEditDialog( false );
		setShowDeleteDialog( false );
	}

	function getPriceFromProduct( product: Product, price: string ) {
		switch ( product.renewal_schedule ) {
			case PLAN_MONTHLY_FREQUENCY:
				return translate( '%s/month', { args: price } );
			case PLAN_YEARLY_FREQUENCY:
				return translate( '%s/year', { args: price } );
			case PLAN_ONE_TIME_FREQUENCY:
			default:
				return price;
		}
	}

	useEffect( () => {
		const showAddEditDialogInitially =
			window.location.hash === ADD_NEW_PAYMENT_PLAN_HASH ||
			window.location.hash === OLD_ADD_NEWSLETTER_PAYMENT_PLAN_HASH ||
			window.location.hash === ADD_TIER_PLAN_HASH;

		if ( showAddEditDialogInitially ) {
			setShowAddEditDialog( true );
		}
	}, [] );

	return (
		<div className="memberships__products-list">
			<QueryMembershipsSettings siteId={ site?.ID ?? 0 } />
			<QueryMembershipProducts siteId={ site?.ID ?? 0 } />
			{ hasLoadedFeatures && ! hasStripeFeature && (
				// Purposefully isn't a dismissible nudge as without this nudge, the page would appear to be
				// broken as it only does listing and deleting of plans and it wouldn't be clear how to change that.
				<UpsellNudge
					title={ translate( 'Upgrade to modify payment plans or add new plans' ) }
					href={ '/plans/' + site?.slug }
					showIcon
					onClick={ () => trackUpgrade() }
					// This could be any stripe payment features (see `hasStripeFeature`) but UpsellNudge only
					// supports 1. They're all available on the same plans anyway, so practically it's ok to pick 1.
					feature={ FEATURE_RECURRING_PAYMENTS }
					event="calypso_earn_page_payment_plans_upgrade_nudge"
					tracksClickName="calypso_earn_page_payment_plans_upgrade_button_click"
					tracksImpressionName="calypso_earn_page_payment_plans_upgrade_button_view"
				/>
			) }

			{ hasLoadedFeatures && hasStripeFeature && (
				<SectionHeader label={ translate( 'Manage plans' ) }>
					<Button primary compact onClick={ onAddNewPaymentPlanButtonClick }>
						{ translate( 'Add a new payment plan' ) }
					</Button>
				</SectionHeader>
			) }
			{ hasLoadedFeatures && hasStripeFeature && ! hasProducts && (
				<Card className="memberships__products-card">
					<div className="memberships__products-card-content">
						<div className="memberships__products-card-title">
							{ translate( 'Set up a one-time offer or recurring payments plan.' ) }
						</div>
					</div>
				</Card>
			) }
			{ hasLoadedFeatures &&
				products
					.filter( ( currentProduct: Product ) => ! currentProduct.tier ) // We remove the "tiers" (the annual products with "tier" type)
					.map( function ( currentProduct: Product ) {
						const currentAnnualProduct = products.find(
							( _prod: Product ) => _prod.tier === currentProduct.ID
						);
						const price = formatCurrency(
							currentProduct?.price || 0,
							currentProduct?.currency || ''
						);
						let annualPrice = '';
						if ( currentAnnualProduct ) {
							annualPrice = formatCurrency(
								currentAnnualProduct?.price || 0,
								currentAnnualProduct?.currency || ''
							);
						}
						return (
							<CompactCard
								className="memberships__products-product-card"
								key={ currentProduct?.ID }
							>
								<div className="memberships__products-product-details">
									<div className="memberships__products-product-title">
										{ currentProduct?.title }
									</div>
									<sub className="memberships__products-product-price">
										{ getPriceFromProduct( currentProduct, price ) }
										{ currentAnnualProduct &&
											translate( ' (%s)', {
												args: getPriceFromProduct( currentAnnualProduct, annualPrice ),
											} ) }
									</sub>
									{ currentProduct.type === TYPE_TIER && (
										<div className="memberships__products-product-badge">
											<Badge type="info">{ translate( 'Newsletter tier' ) }</Badge>
										</div>
									) }
									{ currentProduct?.type === 'donation' && (
										<div className="memberships__products-product-badge">
											<Badge type="info">{ translate( 'Donation' ) }</Badge>
										</div>
									) }
								</div>
								{ currentProduct && currentProduct.ID && renderEllipsisMenu( currentProduct.ID ) }
							</CompactCard>
						);
					} ) }
			{ hasLoadedFeatures && showAddEditDialog && hasStripeFeature && (
				<RecurringPaymentsPlanAddEditModal
					closeDialog={ closeDialog }
					product={ Object.assign( product ?? {}, {
						type: product ? product.type : default_product_type,
					} ) }
					annualProduct={ annualProduct }
				/>
			) }
			{ hasLoadedFeatures && showDeleteDialog && product && (
				<RecurringPaymentsPlanDeleteModal
					closeDialog={ closeDialog }
					product={ product }
					annualProduct={ annualProduct }
				/>
			) }
			{ ! hasLoadedFeatures && (
				<div className="memberships__loading">
					<LoadingEllipsis />
				</div>
			) }
		</div>
	);
}

export default ProductsList;
