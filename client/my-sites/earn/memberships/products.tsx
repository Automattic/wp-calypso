import {
	FEATURE_DONATIONS,
	FEATURE_PREMIUM_CONTENT_CONTAINER,
	FEATURE_RECURRING_PAYMENTS,
} from '@automattic/calypso-products';
import { Badge, Button, CompactCard, Gridicon } from '@automattic/components';
import formatCurrency from '@automattic/format-currency';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import UpsellNudge from 'calypso/blocks/upsell-nudge';
import QueryMembershipProducts from 'calypso/components/data/query-memberships';
import QueryMembershipsSettings from 'calypso/components/data/query-memberships-settings';
import EllipsisMenu from 'calypso/components/ellipsis-menu';
import HeaderCake from 'calypso/components/header-cake';
import { LoadingEllipsis } from 'calypso/components/loading-ellipsis';
import PopoverMenuItem from 'calypso/components/popover-menu/item';
import SectionHeader from 'calypso/components/section-header';
import { useDispatch, useSelector } from 'calypso/state';
import { bumpStat } from 'calypso/state/analytics/actions';
import { getProductsForSiteId } from 'calypso/state/memberships/product-list/selectors';
import { getConnectedAccountIdForSiteId } from 'calypso/state/memberships/settings/selectors';
import getFeaturesBySiteId from 'calypso/state/selectors/get-site-features';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import RecurringPaymentsPlanAddEditModal from '../components/add-edit-plan-modal';
import { Product, Query } from '../types';
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
import MembershipsSection from './section';
import './style.scss';

type MembersProductsSectionProps = {
	query?: Query;
};

const showAddEditDialogInitially =
	window.location.hash === ADD_NEW_PAYMENT_PLAN_HASH ||
	window.location.hash === OLD_ADD_NEWSLETTER_PAYMENT_PLAN_HASH ||
	window.location.hash === ADD_TIER_PLAN_HASH;

function MembershipsProductsSection( { query }: MembersProductsSectionProps ) {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const [ showAddEditDialog, setShowAddEditDialog ] = useState( showAddEditDialogInitially );
	const [ showDeleteDialog, setShowDeleteDialog ] = useState( false );
	const [ product, setProduct ] = useState< Product | null >( null );
	const [ annualProduct, setAnnualProduct ] = useState< Product | null >( null );
	const site = useSelector( ( state ) => getSelectedSite( state ) );
	const features = useSelector( ( state ) => getFeaturesBySiteId( state, site?.ID ) );
	const hasLoadedFeatures = features?.active.length > 0;
	const products: Product[] = useSelector( ( state ) => getProductsForSiteId( state, site?.ID ) );
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

	const defaultToTierPanel =
		window.location.hash === OLD_ADD_NEWSLETTER_PAYMENT_PLAN_HASH ||
		window.location.hash === ADD_TIER_PLAN_HASH;
	const default_product_type = product?.type ?? ( defaultToTierPanel ? TYPE_TIER : null );

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

	return (
		<div>
			<QueryMembershipsSettings siteId={ site?.ID ?? 0 } />
			<QueryMembershipProducts siteId={ site?.ID ?? 0 } />
			<HeaderCake backHref={ '/earn/payments/' + site?.slug }>
				{ translate( 'Payment plans' ) }
			</HeaderCake>

			{ hasLoadedFeatures && ! hasStripeFeature && (
				// Purposefully isn't a dismissible nudge as without this nudge, the page would appear to be
				// broken as it only does listing and deleting of plans and it wouldn't be clear how to change that.
				<UpsellNudge
					title={ translate( 'Upgrade to modify payment plans or add new plans' ) }
					href={ '/plans/' + site?.slug }
					showIcon={ true }
					onClick={ () => trackUpgrade() }
					// This could be any stripe payment features (see `hasStripeFeature`) but UpsellNudge only
					// supports 1. They're all available on the same plans anyway, so practically it's ok to pick 1.
					feature={ FEATURE_RECURRING_PAYMENTS }
					event="calypso_earn_page_payment_plans_upgrade_nudge"
					tracksClickName="calypso_earn_page_payment_plans_upgrade_button_click"
					tracksImpressionName="calypso_earn_page_payment_plans_upgrade_button_view"
				/>
			) }

			{ hasLoadedFeatures && ! connectedAccountId && <MembershipsSection query={ query } /> }
			{ hasLoadedFeatures && hasStripeFeature && connectedAccountId && (
				<SectionHeader>
					<Button primary compact onClick={ () => openAddEditDialog() }>
						{ translate( 'Add a new payment plan' ) }
					</Button>
				</SectionHeader>
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
										{ currentProduct.subscribe_as_site_subscriber
											? translate( '%s/month', { args: price } )
											: price }
										{ currentAnnualProduct && translate( ' (%s/year)', { args: annualPrice } ) }
									</sub>
									{ currentProduct?.subscribe_as_site_subscriber && (
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
			{ hasLoadedFeatures && showAddEditDialog && hasStripeFeature && connectedAccountId && (
				<RecurringPaymentsPlanAddEditModal
					closeDialog={ closeDialog }
					product={ Object.assign( product ?? {}, {
						type: default_product_type,
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

export default MembershipsProductsSection;
