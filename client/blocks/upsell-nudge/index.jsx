/**
 * External dependencies
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import classNames from 'classnames';
import { noop, size } from 'lodash';
import Gridicon from 'components/gridicon';
import JetpackLogo from 'components/jetpack-logo';
import config from 'config';

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
} from 'lib/plans';
import { hasFeature } from 'state/sites/plans/selectors';
import { isFreePlan } from 'lib/products-values';
import isVipSite from 'state/selectors/is-vip-site';
import { preventWidows } from 'lib/formatting';
import { GROUP_JETPACK, GROUP_WPCOM, FEATURE_NO_ADS } from 'lib/plans/constants';
import { addQueryArgs } from 'lib/url';
import { recordTracksEvent } from 'state/analytics/actions';
import { getSelectedSiteId, getSelectedSiteSlug } from 'state/ui/selectors';
import { getSite, isJetpackSite } from 'state/sites/selectors';
import canCurrentUser from 'state/selectors/can-current-user';
import { Button, Card } from '@automattic/components';
import DismissibleCard from 'blocks/dismissible-card';
import PlanPrice from 'my-sites/plan-price';
import TrackComponentView from 'lib/analytics/track-component-view';
import isSiteWPForTeams from 'state/selectors/is-site-wpforteams';

/**
 * Style dependencies
 */
import './style.scss';

export class UpsellNudge extends Component {
	static propTypes = {
		callToAction: PropTypes.string,
		className: PropTypes.string,
		description: PropTypes.node,
		forceHref: PropTypes.bool,
		disableHref: PropTypes.bool,
		dismissPreferenceName: PropTypes.string,
		dismissTemporary: PropTypes.bool,
		event: PropTypes.string,
		feature: PropTypes.string,
		horizontal: PropTypes.bool,
		href: PropTypes.string,
		icon: PropTypes.string,
		isJetpackDevDocs: PropTypes.bool,
		jetpack: PropTypes.bool,
		compact: PropTypes.bool,
		list: PropTypes.arrayOf( PropTypes.string ),
		onClick: PropTypes.func,
		onDismiss: PropTypes.func,
		plan: PropTypes.string,
		price: PropTypes.oneOfType( [ PropTypes.number, PropTypes.arrayOf( PropTypes.number ) ] ),
		showIcon: PropTypes.bool,
		siteSlug: PropTypes.string,
		target: PropTypes.string,
		title: PropTypes.string.isRequired,
		tracksImpressionName: PropTypes.string,
		tracksClickName: PropTypes.string,
		tracksDismissName: PropTypes.string,
		tracksImpressionProperties: PropTypes.object,
		tracksClickProperties: PropTypes.object,
		tracksDismissProperties: PropTypes.object,
		customerType: PropTypes.string,
		isSiteWPForTeams: PropTypes.bool,
	};

	static defaultProps = {
		forceHref: false,
		disableHref: false,
		dismissTemporary: false,
		compact: false,
		horizontal: false,
		isSiteWPForTeams: false,
		onClick: noop,
		onDismiss: noop,
		showIcon: true,
		tracksImpressionName: 'calypso_banner_cta_impression',
		tracksClickName: 'calypso_banner_cta_click',
		tracksDismissName: 'calypso_banner_dismiss',
	};

	getHref() {
		const { canUserUpgrade, feature, href, plan, siteSlug, customerType } = this.props;

		if ( ! href && siteSlug && canUserUpgrade ) {
			if ( customerType ) {
				return `/plans/${ siteSlug }?customerType=${ customerType }`;
			}
			const baseUrl = `/plans/${ siteSlug }`;
			if ( feature || plan ) {
				return addQueryArgs(
					{
						feature,
						plan,
					},
					baseUrl
				);
			}
			return baseUrl;
		}
		return href;
	}

	handleClick = ( e ) => {
		const { event, feature, compact, onClick, tracksClickName, tracksClickProperties } = this.props;

		if ( event && tracksClickName ) {
			this.props.recordTracksEvent( tracksClickName, {
				cta_name: event,
				cta_feature: feature,
				cta_size: compact ? 'compact' : 'regular',
				...tracksClickProperties,
			} );
		}

		onClick( e );
	};

	handleDismiss = ( e ) => {
		const { event, feature, onDismiss, tracksDismissName, tracksDismissProperties } = this.props;

		if ( event && tracksDismissName ) {
			this.props.recordTracksEvent( tracksDismissName, {
				cta_name: event,
				cta_feature: feature,
				...tracksDismissProperties,
			} );
		}

		onDismiss( e );
	};

	getIcon() {
		const { icon, isJetpackDevDocs, jetpack, showIcon } = this.props;

		if ( ! showIcon ) {
			return;
		}

		//If this is a Jetpack nudge, or we're showing an example Jetpack nudge in /devdocs
		if ( jetpack || isJetpackDevDocs ) {
			return (
				<div className="upsell-nudge__icon-plan">
					<JetpackLogo size={ 32 } />
				</div>
			);
		}

		return (
			<div className="upsell-nudge__icons">
				<div className="upsell-nudge__icon">
					<Gridicon icon={ icon || 'star' } size={ 18 } />
				</div>
				<div className="upsell-nudge__icon-circle">
					<Gridicon icon={ icon || 'star' } size={ 18 } />
				</div>
			</div>
		);
	}

	getContent() {
		const {
			callToAction,
			forceHref,
			description,
			event,
			feature,
			compact,
			list,
			price,
			title,
			target,
			tracksImpressionName,
			tracksImpressionProperties,
		} = this.props;

		const prices = Array.isArray( price ) ? price : [ price ];

		return (
			<div className="upsell-nudge__content">
				{ tracksImpressionName && event && (
					<TrackComponentView
						eventName={ tracksImpressionName }
						eventProperties={ {
							cta_name: event,
							cta_feature: feature,
							cta_size: compact ? 'compact' : 'regular',
							...tracksImpressionProperties,
						} }
					/>
				) }
				<div className="upsell-nudge__info">
					<div className="upsell-nudge__title">{ title }</div>
					{ description && <div className="upsell-nudge__description">{ description }</div> }
					{ size( list ) > 0 && (
						<ul className="upsell-nudge__list">
							{ list.map( ( item, key ) => (
								<li key={ key }>
									<Gridicon icon="checkmark" size={ 18 } />
									{ item }
								</li>
							) ) }
						</ul>
					) }
				</div>
				{ ( callToAction || price ) && (
					<div className="upsell-nudge__action">
						{ size( prices ) === 1 && <PlanPrice rawPrice={ prices[ 0 ] } /> }
						{ size( prices ) === 2 && (
							<div className="upsell-nudge__prices">
								<PlanPrice rawPrice={ prices[ 0 ] } original />
								<PlanPrice rawPrice={ prices[ 1 ] } discounted />
							</div>
						) }
						{ callToAction &&
							( forceHref ? (
								<Button compact primary target={ target }>
									{ callToAction }
								</Button>
							) : (
								<Button
									compact
									href={ this.getHref() }
									onClick={ this.handleClick }
									primary
									target={ target }
								>
									{ preventWidows( callToAction ) }
								</Button>
							) ) }
					</div>
				) }
			</div>
		);
	}

	render() {
		const {
			callToAction,
			canManageSite,
			className,
			compact,
			disableHref,
			dismissPreferenceName,
			dismissTemporary,
			feature,
			forceDisplay,
			forceHref,
			horizontal,
			isJetpackDevDocs,
			isVip,
			jetpack,
			plan,
			planHasFeature,
			site,
		} = this.props;

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

		//forceDisplay is an override for upsells shared between Jetpack and WP.com
		if ( shouldNotDisplay && ! forceDisplay ) {
			return null;
		}

		//Never display upsells for WP for Teams
		if ( config.isEnabled( 'signup/wpforteams' ) && this.props.isSiteWPForTeams ) {
			return null;
		}

		const classes = classNames(
			'upsell-nudge',
			className,
			{ 'has-call-to-action': callToAction },
			{ 'is-upgrade-blogger': plan && isBloggerPlan( plan ) },
			{ 'is-upgrade-personal': plan && isPersonalPlan( plan ) },
			{ 'is-upgrade-premium': plan && isPremiumPlan( plan ) },
			{ 'is-upgrade-business': plan && isBusinessPlan( plan ) },
			{ 'is-upgrade-ecommerce': plan && isEcommercePlan( plan ) },
			{ 'is-jetpack-plan': plan && planMatches( plan, { group: GROUP_JETPACK } ) },
			{ 'is-wpcom-plan': plan && planMatches( plan, { group: GROUP_WPCOM } ) },
			{ 'is-compact': compact },
			{ 'is-dismissible': dismissPreferenceName },
			{ 'is-horizontal': horizontal },
			{ 'is-jetpack': jetpack || isJetpackDevDocs }
		);

		if ( dismissPreferenceName ) {
			return (
				<DismissibleCard
					className={ classes }
					preferenceName={ dismissPreferenceName }
					temporary={ dismissTemporary }
					onClick={ this.handleDismiss }
				>
					{ this.getIcon() }
					{ this.getContent() }
				</DismissibleCard>
			);
		}

		return (
			<Card
				className={ classes }
				href={ ( disableHref || callToAction ) && ! forceHref ? null : this.getHref() }
				onClick={ callToAction && ! forceHref ? null : this.handleClick }
			>
				{ this.getIcon() }
				{ this.getContent() }
			</Card>
		);
	}
}

const mapStateToProps = ( state, ownProps ) => {
	const siteId = getSelectedSiteId( state );

	return {
		siteSlug: ownProps.disableHref ? null : getSelectedSiteSlug( state ),
		canUserUpgrade: canCurrentUser( state, getSelectedSiteId( state ), 'manage_options' ),
		isSiteWPForTeams: isSiteWPForTeams( state, getSelectedSiteId( state ) ),
		site: getSite( state, siteId ),
		planHasFeature: hasFeature( state, siteId, ownProps.feature ),
		canManageSite: canCurrentUser( state, siteId, 'manage_options' ),
		jetpack: isJetpackSite( state, siteId ),
		isVip: isVipSite( state, siteId ),
	};
};

export default connect( mapStateToProps, { recordTracksEvent } )( UpsellNudge );
