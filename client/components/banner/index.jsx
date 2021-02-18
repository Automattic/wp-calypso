/**
 * External dependencies
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import classNames from 'classnames';
import { noop, size } from 'lodash';
import Gridicon from 'calypso/components/gridicon';
import JetpackLogo from 'calypso/components/jetpack-logo';
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
} from 'calypso/lib/plans';
import { GROUP_JETPACK, GROUP_WPCOM } from 'calypso/lib/plans/constants';
import { addQueryArgs } from 'calypso/lib/url';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import canCurrentUser from 'calypso/state/selectors/can-current-user';
import { Button, Card } from '@automattic/components';
import DismissibleCard from 'calypso/blocks/dismissible-card';
import PlanPrice from 'calypso/my-sites/plan-price';
import TrackComponentView from 'calypso/lib/analytics/track-component-view';
import isSiteWPForTeams from 'calypso/state/selectors/is-site-wpforteams';
import { preventWidows } from 'calypso/lib/formatting';

/**
 * Style dependencies
 */
import './style.scss';

export class Banner extends Component {
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
		iconPath: PropTypes.string,
		jetpack: PropTypes.bool,
		compact: PropTypes.bool,
		list: PropTypes.arrayOf( PropTypes.string ),
		onClick: PropTypes.func,
		onDismiss: PropTypes.func,
		plan: PropTypes.string,
		price: PropTypes.oneOfType( [ PropTypes.number, PropTypes.arrayOf( PropTypes.number ) ] ),
		primaryButton: PropTypes.bool,
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
		jetpack: false,
		onClick: noop,
		onDismiss: noop,
		primaryButton: true,
		showIcon: true,
		tracksImpressionName: 'calypso_banner_cta_impression',
		tracksClickName: 'calypso_banner_cta_click',
		tracksDismissName: 'calypso_banner_dismiss',
		isSiteWPForTeams: false,
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
		const { icon, iconPath, jetpack, showIcon } = this.props;

		if ( ! showIcon ) {
			return;
		}

		if ( jetpack ) {
			return (
				<div className="banner__icon-plan">
					<JetpackLogo size={ 32 } />
				</div>
			);
		}

		let iconComponent;
		if ( iconPath ) {
			iconComponent = <img src={ iconPath } alt="" />;
		} else {
			iconComponent = <Gridicon icon={ icon || 'star' } size={ 18 } />;
		}

		return (
			<div className="banner__icons">
				<div className="banner__icon">{ iconComponent }</div>
				<div className="banner__icon-circle">{ iconComponent }</div>
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
			primaryButton,
			title,
			target,
			tracksImpressionName,
			tracksImpressionProperties,
		} = this.props;

		const prices = Array.isArray( price ) ? price : [ price ];

		return (
			<div className="banner__content">
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
				<div className="banner__info">
					<div className="banner__title">{ title }</div>
					{ description && <div className="banner__description">{ description }</div> }
					{ size( list ) > 0 && (
						<ul className="banner__list">
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
					<div className="banner__action">
						{ size( prices ) === 1 && <PlanPrice rawPrice={ prices[ 0 ] } /> }
						{ size( prices ) === 2 && (
							<div className="banner__prices">
								<PlanPrice rawPrice={ prices[ 0 ] } original />
								<PlanPrice rawPrice={ prices[ 1 ] } discounted />
							</div>
						) }
						{ callToAction &&
							( forceHref ? (
								<Button compact primary={ primaryButton } target={ target }>
									{ preventWidows( callToAction ) }
								</Button>
							) : (
								<Button
									compact
									href={ this.getHref() }
									onClick={ this.handleClick }
									primary={ primaryButton }
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
			className,
			compact,
			disableHref,
			dismissPreferenceName,
			dismissTemporary,
			forceHref,
			horizontal,
			jetpack,
			plan,
		} = this.props;

		// No Banners for WP for Teams sites.
		if ( config.isEnabled( 'signup/wpforteams' ) && this.props.isSiteWPForTeams ) {
			return null;
		}

		const classes = classNames(
			'banner',
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
			{ 'is-jetpack': jetpack }
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

const mapStateToProps = ( state, ownProps ) => ( {
	siteSlug: ownProps.disableHref ? null : getSelectedSiteSlug( state ),
	canUserUpgrade: canCurrentUser( state, getSelectedSiteId( state ), 'manage_options' ),
	isSiteWPForTeams: isSiteWPForTeams( state, getSelectedSiteId( state ) ),
} );

export default connect( mapStateToProps, { recordTracksEvent } )( Banner );
