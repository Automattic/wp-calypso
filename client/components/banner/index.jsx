/**
 * External dependencies
 */
import classNames from 'classnames';
import Gridicon from 'gridicons';
import { includes, noop, size } from 'lodash';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import DismissibleCard from 'blocks/dismissible-card';
import Button from 'components/button';
import Card from 'components/card';
import PlanIcon from 'components/plans/plan-icon';
import TrackComponentView from 'lib/analytics/track-component-view';
import { getValidFeatureKeys } from 'lib/plans';
import { PLAN_PERSONAL, PLAN_PREMIUM, PLAN_BUSINESS, PLAN_JETPACK_BUSINESS, PLAN_JETPACK_BUSINESS_MONTHLY, PLAN_JETPACK_PERSONAL, PLAN_JETPACK_PERSONAL_MONTHLY, PLAN_JETPACK_PREMIUM, PLAN_JETPACK_PREMIUM_MONTHLY } from 'lib/plans/constants';
import PlanPrice from 'my-sites/plan-price';
import { recordTracksEvent } from 'state/analytics/actions';
import { getSelectedSiteSlug } from 'state/ui/selectors';

class Banner extends Component {

	static propTypes = {
		callToAction: PropTypes.string,
		className: PropTypes.string,
		description: PropTypes.string,
		disableHref: PropTypes.bool,
		dismissPreferenceName: PropTypes.string,
		dismissTemporary: PropTypes.bool,
		event: PropTypes.string,
		feature: PropTypes.oneOf( getValidFeatureKeys() ),
		href: PropTypes.string,
		icon: PropTypes.string,
		list: PropTypes.arrayOf( PropTypes.string ),
		onClick: PropTypes.func,
		plan: PropTypes.string,
		price: PropTypes.oneOfType( [ PropTypes.number, PropTypes.arrayOf( PropTypes.number ) ] ),
		siteSlug: PropTypes.string,
		title: PropTypes.string.isRequired,
	};

	static defaultProps = {
		disableHref: false,
		dismissTemporary: false,
		onClick: noop,
	};

	getHref() {
		const {
			href,
			feature,
			siteSlug,
		} = this.props;

		if ( ! href && siteSlug ) {
			if ( feature ) {
				return `/plans/${ siteSlug }?feature=${ feature }`;
			}
			return `/plans/${ siteSlug }`;
		}
		return href;
	}

	handleClick = ( e ) => {
		const {
			event,
			feature,
			onClick,
		} = this.props;

		if ( event ) {
			this.props.recordTracksEvent(
				'calypso_banner_cta_click', {
					cta_name: event,
					cta_feature: feature,
					cta_size: 'regular'
				} );
		}

		onClick( e );
	}

	getIcon() {
		const {
			icon,
			plan,
		} = this.props;

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
			description,
			event,
			feature,
			list,
			price,
			title,
		} = this.props;

		const prices = Array.isArray( price ) ? price : [ price ];

		return (
			<div className="banner__content">
				{
					event && <TrackComponentView
						eventName={ 'calypso_banner_cta_impression' }
						eventProperties={
							{
								cta_name: event,
								cta_feature: feature,
								cta_size: 'regular'
							}
						}
					/>
				}
				<div className="banner__info">
					<div className="banner__title">
						{ title }
					</div>
					{ description &&
						<div className="banner__description">
							{ description }
						</div>
					}
					{ size( list ) > 0 &&
						<ul className="banner__list">
							{ list.map( ( item, key ) =>
								<li key={ key }>
									<Gridicon icon="checkmark" size={ 18 } />
									{ item }
								</li>
							) }
						</ul>
					}
				</div>
				{ ( callToAction || price ) &&
					<div className="banner__action">
						{ size( prices ) === 1 &&
							<PlanPrice rawPrice={ prices[ 0 ] } />
						}
						{ size( prices ) === 2 &&
							<div className="banner__prices">
								<PlanPrice rawPrice={ prices[ 0 ] } original />
								<PlanPrice rawPrice={ prices[ 1 ] } discounted />
							</div>
						}
						{ callToAction &&
							<Button
								compact
								href={ this.getHref() }
								onClick={ this.handleClick }
								primary
							>
								{ callToAction }
							</Button>
						}
					</div>
				}
			</div>
		);
	}

	render() {
		const {
			callToAction,
			className,
			disableHref,
			dismissPreferenceName,
			dismissTemporary,
			plan,
		} = this.props;

		const classes = classNames(
			'banner',
			className,
			{ 'has-call-to-action': callToAction },
			{ 'is-upgrade-personal':
				includes( [
					PLAN_PERSONAL,
					PLAN_JETPACK_PERSONAL,
					PLAN_JETPACK_PERSONAL_MONTHLY,
				], plan )
			},
			{ 'is-upgrade-premium':
				includes( [
					PLAN_PREMIUM,
					PLAN_JETPACK_PREMIUM,
					PLAN_JETPACK_PREMIUM_MONTHLY,
				], plan ) },
			{ 'is-upgrade-business':
				includes( [
					PLAN_BUSINESS,
					PLAN_JETPACK_BUSINESS,
					PLAN_JETPACK_BUSINESS_MONTHLY,
				], plan )
			},
			{ 'is-dismissible': dismissPreferenceName }
		);

		if ( dismissPreferenceName ) {
			return (
				<DismissibleCard
					className={ classes }
					preferenceName={ dismissPreferenceName }
					temporary={ dismissTemporary }
				>
					{ this.getIcon() }
					{ this.getContent() }
				</DismissibleCard>
			);
		}

		return (
			<Card
				className={ classes }
				href={ disableHref || callToAction ? null : this.getHref() }
				onClick={ callToAction ? noop : this.handleClick }
			>
				{ this.getIcon() }
				{ this.getContent() }
			</Card>
		);
	}

}

const mapStateToProps = ( state, ownProps ) => ( {
	siteSlug: ownProps.disableHref ? null : getSelectedSiteSlug( state ),
} );

export default connect(
	mapStateToProps,
	{ recordTracksEvent }
)( Banner );
