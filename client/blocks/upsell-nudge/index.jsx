import {
	planMatches,
	isBloggerPlan,
	isPersonalPlan,
	isPremiumPlan,
	isBusinessPlan,
	isEcommercePlan,
	GROUP_JETPACK,
	GROUP_WPCOM,
	WPCOM_FEATURES_NO_ADVERTS,
	isFreePlanProduct,
} from '@automattic/calypso-products';
import { StripeHookProvider } from '@automattic/calypso-stripe';
import { createRequestCartProduct } from '@automattic/shopping-cart';
import classnames from 'classnames';
import debugFactory from 'debug';
import { useTranslate } from 'i18n-calypso';
import { useMemo, useState } from 'react';
import { connect, useDispatch } from 'react-redux';
import Banner from 'calypso/components/banner';
import { getStripeConfiguration } from 'calypso/lib/store-transactions';
import { addQueryArgs } from 'calypso/lib/url';
import CalypsoShoppingCartProvider from 'calypso/my-sites/checkout/calypso-shopping-cart-provider';
import PurchaseModal from 'calypso/my-sites/checkout/purchase-modal';
import { withIsEligibleForOneClickCheckout } from 'calypso/my-sites/checkout/purchase-modal/with-is-eligible-for-one-click-checkout';
import { successNotice } from 'calypso/state/notices/actions';
import { canCurrentUser } from 'calypso/state/selectors/can-current-user';
import isSiteAutomatedTransfer from 'calypso/state/selectors/is-site-automated-transfer';
import isSiteWPForTeams from 'calypso/state/selectors/is-site-wpforteams';
import isVipSite from 'calypso/state/selectors/is-vip-site';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import {
	getCurrentPlan,
	isSiteOnECommerceTrial,
	isSiteOnWooExpress,
} from 'calypso/state/sites/plans/selectors';
import { getSite, isJetpackSite } from 'calypso/state/sites/selectors';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';

import './style.scss';

const debug = debugFactory( 'calypso:upsell-nudge' );

/**
 * @param {any} props Props declared as `any` to prevent errors in TSX files that use this component.
 */
export const UpsellNudge = ( {
	callToAction,
	secondaryCallToAction,
	canManageSite,
	canUserUpgrade,
	className,
	compact,
	compactButton,
	customerType,
	description,
	disableHref,
	dismissPreferenceName,
	dismissTemporary,
	event,
	secondaryEvent,
	feature,
	forceDisplay,
	forceHref,
	horizontal,
	href,
	secondaryHref,
	isJetpackDevDocs,
	isJetpack,
	isAtomic,
	isVip,
	siteIsWPForTeams,
	list,
	renderListItem,
	onClick,
	secondaryOnClick,
	onDismissClick,
	plan,
	price,
	primaryButton,
	selectedSiteHasFeature,
	showIcon = false,
	icon = 'star',
	site,
	siteSlug,
	target,
	title,
	tracksClickName,
	tracksClickProperties,
	tracksDismissName,
	tracksDismissProperties,
	tracksImpressionName,
	tracksImpressionProperties,
	displayAsLink,
	isSiteWooExpressOrEcomFreeTrial,
	isBusy,
	isEligibleForOneClickCheckout,
	isOneClickCheckoutEnabled = false,
} ) => {
	const [ showPurchaseModal, setShowPurchaseModal ] = useState( false );
	const translate = useTranslate();
	const dispatch = useDispatch();
	const product = useMemo(
		() => ( plan ? createRequestCartProduct( { product_slug: plan } ) : null ),
		[ plan ]
	);
	const shouldNotDisplay =
		isVip ||
		! canManageSite ||
		! site ||
		typeof site !== 'object' ||
		typeof site.jetpack !== 'boolean' ||
		( feature && selectedSiteHasFeature ) ||
		( ! feature && ! isFreePlanProduct( site.plan ) ) ||
		( feature === WPCOM_FEATURES_NO_ADVERTS && site.options.wordads ) ||
		( ! isJetpack && site.jetpack ) ||
		( isJetpack && ! site.jetpack );

	if ( shouldNotDisplay && ! forceDisplay ) {
		return null;
	}

	// No upsells for WP for Teams sites
	if ( siteIsWPForTeams ) {
		return null;
	}

	if ( ! href && siteSlug && canUserUpgrade ) {
		href = addQueryArgs( { feature, plan }, `/plans/${ siteSlug }` );
		if ( customerType ) {
			href = `/plans/${ siteSlug }?customerType=${ customerType }`;
		}
	}

	const classes = classnames(
		'upsell-nudge',
		className,
		{ 'is-upgrade-blogger': plan && isBloggerPlan( plan ) },
		{ 'is-upgrade-personal': plan && isPersonalPlan( plan ) },
		{ 'is-upgrade-premium': plan && isPremiumPlan( plan ) },
		{ 'is-upgrade-business': plan && isBusinessPlan( plan ) },
		{ 'is-upgrade-ecommerce': plan && isEcommercePlan( plan ) },
		{ 'is-jetpack-plan': plan && planMatches( plan, { group: GROUP_JETPACK } ) },
		{ 'is-wpcom-plan': plan && planMatches( plan, { group: GROUP_WPCOM } ) },
		{ 'is-wooexpress-or-free-trial-plan': isSiteWooExpressOrEcomFreeTrial }
	);

	if ( dismissPreferenceName && forceHref && href ) {
		debug(
			"It's not possible to force the whole banner to be a link when it needs to link and be dismissable"
		);
	}

	const handleClick = ( e ) => {
		if (
			isOneClickCheckoutEnabled &&
			isEligibleForOneClickCheckout.result === true &&
			plan &&
			siteSlug &&
			canUserUpgrade
		) {
			e.preventDefault();
			setShowPurchaseModal( true );
		}
		onClick?.();
	};

	return (
		<>
			{ showPurchaseModal && (
				<CalypsoShoppingCartProvider>
					<StripeHookProvider
						fetchStripeConfiguration={ getStripeConfiguration }
						locale={ translate.localeSlug }
					>
						<PurchaseModal
							productToAdd={ product }
							onClose={ () => {
								setShowPurchaseModal( false );
							} }
							onPurchaseSuccess={ () => {
								setShowPurchaseModal( false );
								dispatch(
									successNotice( translate( 'Your purchase has been completed!' ), {
										id: 'plugins-purchase-modal-success',
									} )
								);
							} }
							disableThankYouPage={ true }
							showFeatureList={ true }
							siteSlug={ siteSlug }
						/>
					</StripeHookProvider>
				</CalypsoShoppingCartProvider>
			) }
			<Banner
				callToAction={ callToAction }
				secondaryCallToAction={ secondaryCallToAction }
				className={ classes }
				compact={ compact }
				compactButton={ compactButton }
				description={ description }
				disableHref={ disableHref }
				dismissPreferenceName={ dismissPreferenceName }
				dismissTemporary={ dismissTemporary }
				event={ event }
				secondaryEvent={ secondaryEvent }
				feature={ feature }
				forceHref={ forceHref }
				horizontal={ horizontal }
				href={ href }
				secondaryHref={ secondaryHref }
				icon={ icon }
				jetpack={ isJetpack || isJetpackDevDocs } //Force show Jetpack example in Devdocs
				isAtomic={ isAtomic }
				list={ list }
				renderListItem={ renderListItem }
				onClick={ handleClick }
				secondaryOnClick={ secondaryOnClick }
				onDismiss={ onDismissClick }
				plan={ plan }
				price={ price }
				primaryButton={ primaryButton }
				showIcon={ showIcon }
				target={ target }
				title={ title }
				tracksClickName={ tracksClickName }
				tracksClickProperties={ tracksClickProperties }
				tracksDismissName={ tracksDismissName }
				tracksDismissProperties={ tracksDismissProperties }
				tracksImpressionName={ tracksImpressionName }
				tracksImpressionProperties={ tracksImpressionProperties }
				displayAsLink={ displayAsLink }
				isBusy={
					isBusy || ( isOneClickCheckoutEnabled && isEligibleForOneClickCheckout.isLoading )
				}
			/>
		</>
	);
};

UpsellNudge.defaultProps = {
	primaryButton: true,
	compactButton: true,
};

export default connect( ( state, ownProps ) => {
	const siteId = getSelectedSiteId( state );

	return {
		site: getSite( state, siteId ),
		selectedSiteHasFeature: siteHasFeature( state, siteId, ownProps.feature ),
		canManageSite: canCurrentUser( state, siteId, 'manage_options' ),
		isJetpack: isJetpackSite( state, siteId ),
		isAtomic: isSiteAutomatedTransfer( state, siteId ),
		isVip: isVipSite( state, siteId ),
		isSiteWooExpressOrEcomFreeTrial:
			isSiteOnECommerceTrial( state, siteId ) || isSiteOnWooExpress( state, siteId ),
		currentPlan: getCurrentPlan( state, siteId ),
		siteSlug: ownProps.disableHref ? null : getSelectedSiteSlug( state ),
		canUserUpgrade: canCurrentUser( state, getSelectedSiteId( state ), 'manage_options' ),
		siteIsWPForTeams: isSiteWPForTeams( state, getSelectedSiteId( state ) ),
	};
} )( withIsEligibleForOneClickCheckout( UpsellNudge ) );
