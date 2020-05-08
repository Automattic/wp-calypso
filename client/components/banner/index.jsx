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

/**
 * Internal dependencies
 */
import { recordTracksEvent } from 'state/analytics/actions';
import { Button, Card } from '@automattic/components';
import DismissibleCard from 'blocks/dismissible-card';
import PlanPrice from 'my-sites/plan-price';
import TrackComponentView from 'lib/analytics/track-component-view';
import { preventWidows } from 'lib/formatting';

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
		jetpack: PropTypes.bool,
		compact: PropTypes.bool,
		list: PropTypes.arrayOf( PropTypes.string ),
		onClick: PropTypes.func,
		onDismiss: PropTypes.func,
		plan: PropTypes.string,
		price: PropTypes.oneOfType( [ PropTypes.number, PropTypes.arrayOf( PropTypes.number ) ] ),
		primaryButton: PropTypes.bool,
		showIcon: PropTypes.bool,
		target: PropTypes.string,
		title: PropTypes.string.isRequired,
		tracksImpressionName: PropTypes.string,
		tracksClickName: PropTypes.string,
		tracksDismissName: PropTypes.string,
		tracksImpressionProperties: PropTypes.object,
		tracksClickProperties: PropTypes.object,
		tracksDismissProperties: PropTypes.object,
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
	};

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
		const { icon, jetpack, showIcon } = this.props;

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

		return (
			<div className="banner__icons">
				<div className="banner__icon">
					<Gridicon icon={ icon || 'star' } size={ 18 } />
				</div>
				<div className="banner__icon-circle">
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
			href,
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
									href={ href }
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
			href,
			horizontal,
			jetpack,
		} = this.props;

		const classes = classNames(
			'banner',
			className,
			{ 'has-call-to-action': callToAction },
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
				href={ ( disableHref || callToAction ) && ! forceHref ? null : href }
				onClick={ callToAction && ! forceHref ? null : this.handleClick }
			>
				{ this.getIcon() }
				{ this.getContent() }
			</Card>
		);
	}
}

export default connect( null, { recordTracksEvent } )( Banner );
