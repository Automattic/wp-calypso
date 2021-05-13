/**
 * External dependencies
 */
import React from 'react';
import classnames from 'classnames';
import { connect } from 'react-redux';
import config from '@automattic/calypso-config';

/**
 * Internal dependencies
 */
import {
	planMatches,
	isBloggerPlan,
	isPersonalPlan,
	isPremiumPlan,
	isBusinessPlan,
	isEcommercePlan,
	GROUP_JETPACK,
	GROUP_WPCOM,
	FEATURE_NO_ADS,
	isFreePlanProduct,
} from '@automattic/calypso-products';
import Banner from 'calypso/components/banner';
import { addQueryArgs } from 'calypso/lib/url';
import { hasFeature } from 'calypso/state/sites/plans/selectors';
import canCurrentUser from 'calypso/state/selectors/can-current-user';
import isVipSite from 'calypso/state/selectors/is-vip-site';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import { getSite, isJetpackSite } from 'calypso/state/sites/selectors';
import isSiteWPForTeams from 'calypso/state/selectors/is-site-wpforteams';

/**
 * Style dependencies
 */
import './style.scss';

export const UpsellNudge = ( {
	callToAction,
	canManageSite,
	canUserUpgrade,
	className,
	compact,
	customerType,
	description,
	disableHref,
	dismissPreferenceName,
	event,
	feature,
	forceDisplay,
	forceHref,
	horizontal,
	href,
	isJetpackDevDocs,
	jetpack,
	isVip,
	siteIsWPForTeams,
	list,
	onClick,
	onDismissClick,
	plan,
	planHasFeature,
	price,
	primaryButton,
	showIcon = false,
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
} ) => {
	const shouldNotDisplay =
		isVip ||
		! canManageSite ||
		! site ||
		typeof site !== 'object' ||
		typeof site.jetpack !== 'boolean' ||
		( feature && planHasFeature ) ||
		( ! feature && ! isFreePlanProduct( site.plan ) ) ||
		( feature === FEATURE_NO_ADS && site.options.wordads ) ||
		( ! jetpack && site.jetpack ) ||
		( jetpack && ! site.jetpack );

	if ( shouldNotDisplay && ! forceDisplay ) {
		return null;
	}

	// No upsells for WP for Teams sites
	if ( config.isEnabled( 'signup/wpforteams' ) && siteIsWPForTeams ) {
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
		{ 'is-wpcom-plan': plan && planMatches( plan, { group: GROUP_WPCOM } ) }
	);

	return (
		<Banner
			callToAction={ callToAction }
			className={ classes }
			compact={ compact }
			description={ description }
			disableHref={ disableHref }
			dismissPreferenceName={ dismissPreferenceName }
			event={ event }
			feature={ feature }
			forceHref={ forceHref }
			horizontal={ horizontal }
			href={ href }
			icon="star"
			jetpack={ jetpack || isJetpackDevDocs } //Force show Jetpack example in Devdocs
			list={ list }
			onClick={ onClick }
			onDismissClick={ onDismissClick }
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

UpsellNudge.defaultProps = {
	primaryButton: true,
};

export default connect( ( state, ownProps ) => {
	const siteId = getSelectedSiteId( state );

	return {
		site: getSite( state, siteId ),
		planHasFeature: hasFeature( state, siteId, ownProps.feature ),
		canManageSite: canCurrentUser( state, siteId, 'manage_options' ),
		jetpack: isJetpackSite( state, siteId ),
		isVip: isVipSite( state, siteId ),
		siteSlug: ownProps.disableHref ? null : getSelectedSiteSlug( state ),
		canUserUpgrade: canCurrentUser( state, getSelectedSiteId( state ), 'manage_options' ),
		siteIsWPForTeams: isSiteWPForTeams( state, getSelectedSiteId( state ) ),
	};
} )( UpsellNudge );
