/**
 * External dependencies
 */
import React from 'react';
import classnames from 'classnames';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Banner from 'components/banner';
import { FEATURE_NO_ADS } from 'lib/plans/constants';
import { addQueryArgs } from 'lib/url';
import { hasFeature } from 'state/sites/plans/selectors';
import { isFreePlan } from 'lib/products-values';
import canCurrentUser from 'state/selectors/can-current-user';
import isVipSite from 'state/selectors/is-vip-site';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getSite, isJetpackSite } from 'state/sites/selectors';

/**
 * Style dependencies
 */
import './style.scss';

export const UpsellNudge = ( {
	callToAction,
	canManageSite,
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
	href,
	icon,
	isJetpackDevDocs,
	jetpack,
	horizontal,
	isVip,
	list,
	onClick,
	onDismissClick,
	plan,
	planHasFeature,
	price,
	showIcon = false,
	site,
	title,
	tracksClickName,
	tracksClickProperties,
	tracksDismissName,
	tracksDismissProperties,
	tracksImpressionName,
	tracksImpressionProperties,
} ) => {
	const classes = classnames( 'upsell-nudge', className );

	const shouldNotDisplay =
		isVip ||
		! canManageSite ||
		! site ||
		typeof site !== 'object' ||
		typeof site.jetpack !== 'boolean' ||
		( feature && planHasFeature ) ||
		( ! feature && ! isFreePlan( site.plan ) ) ||
		( feature === FEATURE_NO_ADS && site.options.wordads ) ||
		( ! jetpack && site.jetpack ) ||
		( jetpack && ! site.jetpack );

	if ( shouldNotDisplay && ! forceDisplay ) {
		return null;
	}

	if ( ! href && site && ! customerType ) {
		href = addQueryArgs( { feature, plan }, `/plans/${ site.slug }` );
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
			event={ event }
			feature={ feature }
			forceHref={ forceHref }
			horizontal={ horizontal }
			href={ href }
			icon={ icon }
			jetpack={ jetpack || isJetpackDevDocs } //Force show Jetpack example in Devdocs
			list={ list }
			onClick={ onClick }
			onDismissClick={ onDismissClick }
			plan={ plan }
			price={ price }
			showIcon={ showIcon }
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
		planHasFeature: hasFeature( state, siteId, ownProps.feature ),
		canManageSite: canCurrentUser( state, siteId, 'manage_options' ),
		jetpack: isJetpackSite( state, siteId ),
		isVip: isVipSite( state, siteId ),
	};
} )( localize( UpsellNudge ) );
