/**
 * External dependencies
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import classNames from 'classnames';
import { noop, size } from 'lodash';
import Gridicon from 'gridicons';

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
import { GROUP_JETPACK, GROUP_WPCOM } from 'lib/plans/constants';
import { addQueryArgs } from 'lib/url';
import { recordTracksEvent } from 'state/analytics/actions';
import { getSelectedSiteId, getSelectedSiteSlug } from 'state/ui/selectors';
import canCurrentUser from 'state/selectors/can-current-user';
import Button from 'components/button';
import Card from 'components/card';
import DismissibleCard from 'blocks/dismissible-card';
import PlanIcon from 'components/plans/plan-icon';
import PlanPrice from 'my-sites/plan-price';
import TrackComponentView from 'lib/analytics/track-component-view';

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
		href: PropTypes.string,
		icon: PropTypes.string,
		list: PropTypes.arrayOf( PropTypes.string ),
		onClick: PropTypes.func,
		onDismiss: PropTypes.func,
		plan: PropTypes.string,
		price: PropTypes.oneOfType( [ PropTypes.number, PropTypes.arrayOf( PropTypes.number ) ] ),
		siteSlug: PropTypes.string,
		target: PropTypes.string,
		title: PropTypes.string.isRequired,
	};

	static defaultProps = {
		forceHref: false,
		disableHref: false,
		dismissTemporary: false,
		onClick: noop,
		onDismiss: noop,
	};

	getHref() {
		const { canUserUpgrade, feature, href, plan, siteSlug } = this.props;

		if ( ! href && siteSlug && canUserUpgrade ) {
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

	handleClick = e => {
		const { event, feature, onClick } = this.props;

		if ( event ) {
			this.props.recordTracksEvent( 'calypso_banner_cta_click', {
				cta_name: event,
				cta_feature: feature,
				cta_size: 'regular',
			} );
		}

		onClick( e );
	};

	handleDismiss = e => {
		const { event, feature, onDismiss } = this.props;

		if ( event ) {
			this.props.recordTracksEvent( 'calypso_banner_dismiss', {
				cta_name: event,
				cta_feature: feature,
			} );
		}

		onDismiss( e );
	};

	getIcon() {
		const { icon, plan } = this.props;

		if ( plan && ! icon ) {
			return (
				<div className="banner__icon-plan">
					<PlanIcon plan={ plan } />
				</div>
			);
		}

		return (
			<div className="banner__icons">
				<div className="banner__icon">
					<Gridicon icon={ icon || 'info-outline' } size={ 18 } />
				</div>
				<div className="banner__icon-circle">
					<Gridicon icon={ icon || 'info-outline' } size={ 18 } />
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
			list,
			price,
			title,
			target,
		} = this.props;

		const prices = Array.isArray( price ) ? price : [ price ];

		return (
			<div className="banner__content">
				{ event && (
					<TrackComponentView
						eventName={ 'calypso_banner_cta_impression' }
						eventProperties={ {
							cta_name: event,
							cta_feature: feature,
							cta_size: 'regular',
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
									{ callToAction }
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
			forceHref,
			disableHref,
			dismissPreferenceName,
			dismissTemporary,
			plan,
		} = this.props;

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
			{ 'is-dismissible': dismissPreferenceName }
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
} );

export default connect(
	mapStateToProps,
	{ recordTracksEvent }
)( Banner );
