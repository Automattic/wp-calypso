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
	isWpComPlan,
	getPlan,
	findFirstSimilarPlanKey,
} from '@automattic/calypso-products';
import clsx from 'clsx';
import debugFactory from 'debug';
import { useState } from 'react';
import { connect } from 'react-redux';
import AsyncLoad from 'calypso/components/async-load';
import Banner from 'calypso/components/banner';
import TrackComponentView from 'calypso/lib/analytics/track-component-view';
import { addQueryArgs } from 'calypso/lib/url';
import { canCurrentUser } from 'calypso/state/selectors/can-current-user';
import getPrimarySiteId from 'calypso/state/selectors/get-primary-site-id';
import getFeaturesBySiteId from 'calypso/state/selectors/get-site-features';
import isSiteAutomatedTransfer from 'calypso/state/selectors/is-site-automated-transfer';
import isSiteWPForTeams from 'calypso/state/selectors/is-site-wpforteams';
import isVipSite from 'calypso/state/selectors/is-vip-site';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import { isSiteOnECommerceTrial, isSiteOnWooExpress } from 'calypso/state/sites/plans/selectors';
import { getSite, getSiteSlug, isJetpackSite } from 'calypso/state/sites/selectors';
import { getMostRecentlySelectedSiteId, getSelectedSiteId } from 'calypso/state/ui/selectors';
import type { SiteDetails } from '@automattic/data-stores';
import type { IsEligibleForOneClickCheckoutReturnValue } from 'calypso/my-sites/checkout/purchase-modal/use-is-eligible-for-one-click-checkout';
import type { IAppState } from 'calypso/state/types';
import type { SiteSlug } from 'calypso/types';
import type { TranslateResult } from 'i18n-calypso';

import './style.scss';

const debug = debugFactory( 'calypso:upsell-nudge' );

type ConnectedProps = {
	site: SiteDetails | null | undefined;
	selectedSiteHasFeature: boolean | null;
	canManageSite: boolean;
	isJetpack: boolean;
	isAtomic: boolean;
	isVip: boolean;
	isSiteWooExpressOrEcomFreeTrial: boolean;
	siteSlug: SiteSlug | null;
	siteIsWPForTeams: boolean;
};

type OwnProps = {
	callToAction?: TranslateResult;
	className?: string;
	compact?: boolean;
	compactButton?: boolean;
	customerType?: string;
	description?: TranslateResult;
	disableHref?: boolean;
	dismissPreferenceName?: string;
	dismissTemporary?: boolean;
	displayAsLink?: boolean;
	event: string;
	feature?: string;
	forceDisplay?: boolean;
	forceHref?: boolean;
	horizontal?: boolean;
	href?: string;
	icon?: string;
	isBusy?: boolean;
	isEligibleForOneClickCheckout?: IsEligibleForOneClickCheckoutReturnValue;
	isJetpackDevDocs?: boolean;
	isOneClickCheckoutEnabled?: boolean;
	list?: TranslateResult[] | unknown[];
	onClick?: () => void;
	onDismissClick?: () => void;
	plan?: string;
	price?: number[];
	primaryButton?: boolean;
	renderListItem?: ( arg: any ) => void;
	secondaryCallToAction?: TranslateResult;
	secondaryEvent?: string;
	secondaryHref?: string;
	secondaryOnClick?: () => void;
	showIcon?: boolean;
	target?: string;
	title?: TranslateResult;
	tracksClickName?: string;
	tracksClickProperties?: Record< string, unknown >;
	tracksDismissName?: string;
	tracksDismissProperties?: Record< string, unknown >;
	tracksImpressionName?: string;
	tracksImpressionProperties?: Record< string, unknown >;
};

type Props = OwnProps & ConnectedProps;

export const UpsellNudge = ( {
	callToAction,
	secondaryCallToAction,
	canManageSite,
	className,
	compact,
	compactButton = true,
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
	primaryButton = true,
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
	isOneClickCheckoutEnabled = true,
}: Props ) => {
	const [ showPurchaseModal, setShowPurchaseModal ] = useState( false );
	const shouldNotDisplay =
		isVip ||
		! canManageSite ||
		! site ||
		typeof site !== 'object' ||
		typeof site.jetpack !== 'boolean' ||
		( feature && selectedSiteHasFeature === null ) || // Site features haven't loaded yet
		( feature && selectedSiteHasFeature ) ||
		( ! feature && ! ( site.plan && isFreePlanProduct( site.plan ) ) ) ||
		( feature === WPCOM_FEATURES_NO_ADVERTS && site?.options?.wordads ) ||
		( ! isJetpack && site.jetpack ) ||
		( isJetpack && ! site.jetpack );

	if ( shouldNotDisplay && ! forceDisplay ) {
		return null;
	}

	// No upsells for WP for Teams sites
	if ( siteIsWPForTeams ) {
		return null;
	}

	if ( ! href && siteSlug && canManageSite ) {
		href = addQueryArgs( { feature, plan }, `/plans/${ siteSlug }` );
		if ( customerType ) {
			href = `/plans/${ siteSlug }?customerType=${ customerType }`;
		}
	}

	const classes = clsx(
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

	const handleClick = ( e: MouseEvent ) => {
		if (
			isOneClickCheckoutEnabled &&
			isEligibleForOneClickCheckout?.result === true &&
			plan &&
			siteSlug &&
			canManageSite
		) {
			e.preventDefault();
			setShowPurchaseModal( true );
		}
		onClick?.();
	};

	/**
	 * Users can upgrade only to plans on their current plan term or higher.
	 * This ensures that users on a 2-year plan, for example, are not shown an
	 * upsell to 1-year plan.
	 */
	let upsellPlan = plan;
	if ( site?.plan?.product_slug && plan && isWpComPlan( plan ) ) {
		const upsellPlanType = getPlan( plan )?.type;
		upsellPlan = findFirstSimilarPlanKey( site.plan.product_slug, {
			type: upsellPlanType,
		} );
	}

	return (
		<>
			{ showPurchaseModal && (
				<AsyncLoad
					require="./purchase-modal-wrapper"
					plan={ upsellPlan }
					siteSlug={ siteSlug }
					setShowPurchaseModal={ setShowPurchaseModal }
				/>
			) }
			{ ! isEligibleForOneClickCheckout?.isLoading && (
				<TrackComponentView
					eventName="calypso_upsell_nudge_impression"
					eventProperties={ {
						is_eligible_for_one_click_checkout: !! isEligibleForOneClickCheckout?.result,
						plan: plan,
						event,
					} }
				/>
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
					isBusy || ( isOneClickCheckoutEnabled && isEligibleForOneClickCheckout?.isLoading )
				}
			/>
		</>
	);
};

const ConnectedUpsellNudge = connect( ( state: IAppState, ownProps: OwnProps ) => {
	const siteId =
		getSelectedSiteId( state ) ||
		getMostRecentlySelectedSiteId( state ) ||
		getPrimarySiteId( state );
	const siteFeatures = getFeaturesBySiteId( state, siteId || undefined );
	const hasFeature =
		siteFeatures === null ? null : siteHasFeature( state, siteId, ownProps.feature || '' );

	return {
		site: getSite( state, siteId || undefined ),
		selectedSiteHasFeature: hasFeature,
		canManageSite: canCurrentUser( state, siteId, 'manage_options' ),
		isJetpack: isJetpackSite( state, siteId ) || false,
		isAtomic: isSiteAutomatedTransfer( state, siteId ) || false,
		isVip: ( siteId && isVipSite( state, siteId ) ) || false,
		isSiteWooExpressOrEcomFreeTrial: siteId
			? isSiteOnECommerceTrial( state, siteId ) || isSiteOnWooExpress( state, siteId )
			: false,
		siteSlug: ownProps.disableHref ? null : getSiteSlug( state, siteId ),
		siteIsWPForTeams: isSiteWPForTeams( state, siteId ) || false,
	};
} )( UpsellNudge );

export default function Wrapper( props: OwnProps ) {
	const { isOneClickCheckoutEnabled = true, plan } = props;
	if ( isOneClickCheckoutEnabled && plan ) {
		return (
			<AsyncLoad
				require="../../my-sites/checkout/purchase-modal/is-eligible-for-one-click-checkout-wrapper"
				component={ ConnectedUpsellNudge }
				componentProps={ props }
			/>
		);
	}
	return <ConnectedUpsellNudge { ...props } />;
}
