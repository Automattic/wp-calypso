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
import classnames from 'classnames';
import debugFactory from 'debug';
import { connect } from 'react-redux';
import Banner from 'calypso/components/banner';
import { canCurrentUser } from 'calypso/state/selectors/can-current-user';
import isSiteAutomatedTransfer from 'calypso/state/selectors/is-site-automated-transfer';
import isSiteWPForTeams from 'calypso/state/selectors/is-site-wpforteams';
import isVipSite from 'calypso/state/selectors/is-vip-site';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import { getSite, isJetpackSite } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

import './style.scss';

const debug = debugFactory( 'calypso:upsell-nudge' );

export const UpsellNudge = ( {
	callToAction,
	canManageSite,
	className,
	compact,
	customerType,
	description,
	disableHref,
	dismissPreferenceName,
	dismissTemporary,
	event,
	feature,
	forceDisplay,
	forceHref,
	horizontal,
	href,
	isJetpackDevDocs,
	isJetpack,
	isAtomic,
	isVip,
	siteIsWPForTeams,
	list,
	onClick,
	onDismissClick,
	plan,
	price,
	primaryButton = true,
	selectedSiteHasFeature,
	showIcon = false,
	icon = 'star',
	site,
	target,
	title,
	tracksClickName,
	tracksClickProperties,
	tracksDismissName,
	tracksDismissProperties,
	tracksImpressionName,
	tracksImpressionProperties,
} ) => {
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

	const classes = classnames(
		'upsell-nudge',
		className,
		{ 'is-upgrade-blogger': plan && isBloggerPlan( plan ) },
		{ 'is-upgrade-personal': plan && isPersonalPlan( plan ) },
		{ 'is-upgrade-premium': plan && isPremiumPlan( plan ) },
		{ 'is-upgrade-business': plan && isBusinessPlan( plan ) },
		{ 'is-upgrade-ecommerce': plan && isEcommercePlan( plan ) },
		{ 'is-jetpack-plan': plan && planMatches( plan, { group: GROUP_JETPACK } ) },
		{ 'is-wpcom-plan': plan && planMatches( plan, { group: GROUP_WPCOM } ) }
	);

	if ( dismissPreferenceName && forceHref && href ) {
		debug(
			"It's not possible to force the whole banner to be a link when it needs to link and be dismissable"
		);
	}

	return (
		<Banner
			callToAction={ callToAction }
			className={ classes }
			compact={ compact }
			customerType={ customerType }
			description={ description }
			disableHref={ disableHref }
			dismissPreferenceName={ dismissPreferenceName }
			dismissTemporary={ dismissTemporary }
			event={ event }
			feature={ feature }
			forceHref={ forceHref }
			horizontal={ horizontal }
			href={ href }
			icon={ icon }
			jetpack={ isJetpack || isJetpackDevDocs } //Force show Jetpack example in Devdocs
			isAtomic={ isAtomic }
			list={ list }
			onClick={ onClick }
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
		/>
	);
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
		siteIsWPForTeams: isSiteWPForTeams( state, getSelectedSiteId( state ) ),
	};
} )( UpsellNudge );
