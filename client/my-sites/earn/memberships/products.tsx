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
import { Product } from 'calypso/my-sites/earn/types';
import { useDispatch, useSelector } from 'calypso/state';
import { bumpStat } from 'calypso/state/analytics/actions';
import { getProductsForSiteId } from 'calypso/state/memberships/product-list/selectors';
import { getConnectedAccountIdForSiteId } from 'calypso/state/memberships/settings/selectors';
import getFeaturesBySiteId from 'calypso/state/selectors/get-site-features';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import RecurringPaymentsPlanAddEditModal from '../components/add-edit-plan-modal';
import { ADD_NEW_PAYMENT_PLAN_HASH, ADD_NEWSLETTER_PAYMENT_PLAN_HASH } from './constants';
import RecurringPaymentsPlanDeleteModal from './delete-plan-modal';
import MembershipsSection from '.';
import './style.scss';

type MembershipsProductsSectionProps = {
	section: any;
	query: any;
};

const showAddEditDialogInitially =
	window.location.hash === ADD_NEW_PAYMENT_PLAN_HASH ||
	window.location.hash === ADD_NEWSLETTER_PAYMENT_PLAN_HASH;

const MembershipsProductsSection = ( { section, query }: MembershipsProductsSectionProps ) => {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const [ showAddEditDialog, setShowAddEditDialog ] = useState( showAddEditDialogInitially );
	const [ showDeleteDialog, setShowDeleteDialog ] = useState( false );
	const [ product, setProduct ] = useState< Product | null >( null );
	const site = useSelector( ( state ) => getSelectedSite( state ) );
	const features = useSelector( ( state ) => getFeaturesBySiteId( state, site?.ID ) );
	const hasLoadedFeatures = features?.active.length > 0;
	// const hasLoadedFeatures = features && features.hasLoadedFromServer;
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

	const subscribe_as_site_subscriber = product
		? product?.subscribe_as_site_subscriber
		: window.location.hash === ADD_NEWSLETTER_PAYMENT_PLAN_HASH;

	const trackUpgrade = () =>
		dispatch( bumpStat( 'calypso_earn_page', 'payment-plans-upgrade-button' ) );

	const openAddEditDialog = ( productId: string | null ): void => {
		if ( productId ) {
			const product = products.find( ( prod ) => prod.ID === productId );
			setShowAddEditDialog( true );
			setProduct( product ?? null );
		} else {
			setShowAddEditDialog( true );
			setProduct( null );
		}
	};

	const openDeleteDialog = ( productId: string ): void => {
		if ( productId ) {
			const product = products.find( ( prod ) => prod.ID === productId );
			setShowDeleteDialog( true );
			setProduct( product ?? null );
		}
	};

	const closeDialog = () => {
		setShowAddEditDialog( false );
		setShowDeleteDialog( false );
	};

	const renderEllipsisMenu = ( productId: string ) => (
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

			{ hasLoadedFeatures && ! connectedAccountId && (
				<MembershipsSection section={ section } query={ query } />
			) }
			{ hasLoadedFeatures && hasStripeFeature && connectedAccountId && (
				<SectionHeader>
					<Button primary compact onClick={ () => openAddEditDialog( null ) }>
						{ translate( 'Add a new payment plan' ) }
					</Button>
				</SectionHeader>
			) }
			{ hasLoadedFeatures &&
				products.map( ( product ) => (
					<CompactCard className="memberships__products-product-card" key={ product.ID }>
						<div className="memberships__products-product-details">
							<div className="memberships__products-product-price">
								{ formatCurrency( product?.price || 0, product?.currency || '' ) }
							</div>
							<div className="memberships__products-product-title">{ product.title }</div>
							{ product?.subscribe_as_site_subscriber && (
								<div className="memberships__products-product-badge">
									<Badge type="info">{ translate( 'Newsletter' ) }</Badge>
								</div>
							) }
						</div>

						{ renderEllipsisMenu( product?.ID ?? '' ) }
					</CompactCard>
				) ) }
			{ hasLoadedFeatures && showAddEditDialog && hasStripeFeature && connectedAccountId && (
				<RecurringPaymentsPlanAddEditModal
					closeDialog={ closeDialog }
					product={ Object.assign( product ?? {}, {
						subscribe_as_site_subscriber: subscribe_as_site_subscriber,
					} ) }
				/>
			) }
			{ hasLoadedFeatures && showDeleteDialog && (
				<RecurringPaymentsPlanDeleteModal closeDialog={ closeDialog } product={ product } />
			) }
			{ ! hasLoadedFeatures && (
				<div className="memberships__loading">
					<LoadingEllipsis />
				</div>
			) }
		</div>
	);
};

export default MembershipsProductsSection;
