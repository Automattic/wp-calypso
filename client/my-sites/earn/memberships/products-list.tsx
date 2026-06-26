import {
	FEATURE_DONATIONS,
	FEATURE_PREMIUM_CONTENT_CONTAINER,
	FEATURE_RECURRING_PAYMENTS,
} from '@automattic/calypso-products';
import { Badge, Button, Card, CompactCard, Gridicon } from '@automattic/components';
import { formatCurrency } from '@automattic/number-formatters';
import { __experimentalHStack as HStack } from '@wordpress/components';
import DOMPurify from 'dompurify';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useState } from 'react';
import UpsellNudge from 'calypso/blocks/upsell-nudge';
import QueryMembershipProducts from 'calypso/components/data/query-memberships';
import QueryMembershipsSettings from 'calypso/components/data/query-memberships-settings';
import QuerySiteSettings from 'calypso/components/data/query-site-settings';
import EllipsisMenu from 'calypso/components/ellipsis-menu';
import { LoadingEllipsis } from 'calypso/components/loading-ellipsis';
import PopoverMenuItem from 'calypso/components/popover-menu/item';
import SectionHeader from 'calypso/components/section-header';
import { useDispatch, useSelector } from 'calypso/state';
import { bumpStat, recordTracksEvent } from 'calypso/state/analytics/actions';
import { getProductsForSiteId } from 'calypso/state/memberships/product-list/selectors';
import getFeaturesBySiteId from 'calypso/state/selectors/get-site-features';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import { getSiteSettings } from 'calypso/state/site-settings/selectors';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import RecurringPaymentsPlanAddEditModal from '../components/add-edit-plan-modal';
import FreePlanModal from '../components/free-plan-modal';
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
	const [ showFreePlanDialog, setShowFreePlanDialog ] = useState( false );
	const [ product, setProduct ] = useState< Product | null >( null );
	const [ annualProduct, setAnnualProduct ] = useState< Product | null >( null );
	const site = useSelector( getSelectedSite );
	const features = useSelector( ( state ) => getFeaturesBySiteId( state, site?.ID ) );
	const hasLoadedFeatures = features?.active.length > 0;
	const products: Product[] = useSelector( ( state ) => getProductsForSiteId( state, site?.ID ) );
	const hasProducts = products.length > 0;

	// The "Free" newsletter tier is not a product; it's the absence of a paid
	// subscription. We only surface it (and its editable description / hide
	// setting) when at least one paid newsletter tier exists, mirroring the
	// subscriber-facing selector where Free only appears alongside paid tiers.
	const hasNewsletterTier = products.some(
		( currentProduct: Product ) => currentProduct.type === TYPE_TIER && ! currentProduct.tier
	);
	const siteSettings = useSelector( ( state ) => getSiteSettings( state, site?.ID ?? null ) );
	const freeTierDescription: string =
		siteSettings?.subscription_options?.free_tier_description ?? '';
	// Server-rendered markdown for the Free tier, parsed by the same backend
	// parser the subscribe modal uses, so the preview is 1:1 with what
	// subscribers see (the raw value above is still used for editing). It's
	// colocated with subscription_options on the site-settings endpoint, so it
	// stays read-after-write consistent with the source after a save.
	const freeTierDescriptionRendered = siteSettings?.free_tier_description_rendered ?? null;
	const isFreeTierHidden = Boolean( siteSettings?.subscription_options?.hide_free_tier );

	const supportsFreeTierSettings = Boolean( siteSettings?.supports_free_tier_customization );

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

	function openFreePlanDialog() {
		dispatch( recordTracksEvent( 'calypso_earn_page_free_plan_edit_click' ) );
		setShowFreePlanDialog( true );
	}

	function closeDialog() {
		setShowAddEditDialog( false );
		setShowDeleteDialog( false );
		setShowFreePlanDialog( false );
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
			{ /* Site settings are only needed to render/edit the Free tier, which
			     only appears when a newsletter tier exists — avoid the extra
			     request on donation-only / non-newsletter sites. */ }
			{ hasNewsletterTier && site?.ID && <QuerySiteSettings siteId={ site.ID } /> }
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
									{ currentProduct.type === TYPE_TIER &&
										currentProduct.description &&
										( currentProduct.description_rendered ? (
											// Server-rendered (and kses-sanitized) markdown — the same
											// HTML the subscribe modal shows, for a 1:1 preview.
											// DOMPurify is defense-in-depth in case the API's
											// sanitization guarantee ever changes. ADD_ATTR keeps the
											// target="_blank" the server adds to links (DOMPurify
											// strips `target` by default); `rel` is kept by default.
											<div
												className="memberships__products-product-description"
												// eslint-disable-next-line react/no-danger
												dangerouslySetInnerHTML={ {
													__html: DOMPurify.sanitize( currentProduct.description_rendered, {
														ADD_ATTR: [ 'target' ],
													} ),
												} }
											/>
										) : (
											<div className="memberships__products-product-description">
												{ currentProduct.description }
											</div>
										) ) }
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
			{ hasLoadedFeatures && hasStripeFeature && hasNewsletterTier && supportsFreeTierSettings && (
				<CompactCard className="memberships__products-product-card">
					<div className="memberships__products-product-details">
						<div className="memberships__products-product-title">{ translate( 'Free' ) }</div>
						{ freeTierDescriptionRendered ? (
							// Server-rendered (and kses-sanitized) markdown — the same HTML
							// the subscribe modal shows, for a 1:1 preview. DOMPurify is
							// defense-in-depth in case the API's sanitization guarantee ever
							// changes. ADD_ATTR keeps the target="_blank" the server adds to
							// links (DOMPurify strips `target` by default); `rel` is kept by
							// default.
							<div
								className="memberships__products-product-description"
								// eslint-disable-next-line react/no-danger
								dangerouslySetInnerHTML={ {
									__html: DOMPurify.sanitize( freeTierDescriptionRendered, {
										ADD_ATTR: [ 'target' ],
									} ),
								} }
							/>
						) : (
							freeTierDescription && (
								<div className="memberships__products-product-description">
									{ freeTierDescription }
								</div>
							)
						) }
						<sub className="memberships__products-product-price">{ translate( 'Free' ) }</sub>
						<div className="memberships__products-product-badge">
							<HStack spacing={ 2 } justify="flex-start" expanded={ false }>
								<Badge type="info">{ translate( 'Newsletter tier' ) }</Badge>
								{ isFreeTierHidden && (
									<Badge type="warning">{ translate( 'Hidden from subscribers' ) }</Badge>
								) }
							</HStack>
						</div>
					</div>
					<EllipsisMenu position="bottom left">
						{ hasStripeFeature && (
							<PopoverMenuItem onClick={ openFreePlanDialog }>
								<Gridicon size={ 18 } icon="pencil" />
								{ translate( 'Edit' ) }
							</PopoverMenuItem>
						) }
					</EllipsisMenu>
				</CompactCard>
			) }
			{ hasLoadedFeatures && showFreePlanDialog && hasStripeFeature && supportsFreeTierSettings && (
				<FreePlanModal closeDialog={ closeDialog } siteId={ site?.ID } />
			) }
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
