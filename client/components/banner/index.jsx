/**
 * External dependencies
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import classNames from 'classnames';
import { noop } from 'lodash';
import Gridicon from 'components/gridicon';

/**
 * Internal dependencies
 */
import { recordTracksEvent } from 'state/analytics/actions';
import { Button, Card } from '@automattic/components';
import DismissibleCard from 'blocks/dismissible-card';
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
		horizontal: PropTypes.bool,
		href: PropTypes.string,
		icon: PropTypes.string,
		onClick: PropTypes.func,
		onDismiss: PropTypes.func,
		showIcon: PropTypes.bool,
		siteSlug: PropTypes.string,
		target: PropTypes.string,
		title: PropTypes.string.isRequired,
	};

	static defaultProps = {
		forceHref: false,
		disableHref: false,
		dismissTemporary: false,
		horizontal: false,
		onClick: noop,
		onDismiss: noop,
		showIcon: true,
	};

	handleClick = ( e ) => {
		const { event, onClick } = this.props;

		if ( event ) {
			this.props.recordTracksEvent( 'calypso_banner_cta_click', {
				cta_name: event,
			} );
		}

		onClick( e );
	};

	handleDismiss = ( e ) => {
		const { event, onDismiss } = this.props;

		if ( event ) {
			this.props.recordTracksEvent( 'calypso_banner_dismiss', {
				cta_name: event,
			} );
		}

		onDismiss( e );
	};

	getIcon() {
		const { icon, showIcon } = this.props;

		if ( ! showIcon ) {
			return;
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
		const { callToAction, description, event, href, title, target } = this.props;

		return (
			<div className="banner__content">
				{ event && (
					<TrackComponentView
						eventName="calypso_banner_cta_impression"
						eventProperties={ {
							cta_name: event,
						} }
					/>
				) }
				<div className="banner__info">
					<div className="banner__title">{ title }</div>
					{ description && <div className="banner__description">{ description }</div> }
				</div>
				{ callToAction && (
					<div className="banner__action">
						{ this.props.forceHref ? (
							<Button compact primary target={ target }>
								{ callToAction }
							</Button>
						) : (
							<Button compact href={ href } onClick={ this.handleClick } primary target={ target }>
								{ callToAction }
							</Button>
						) }
					</div>
				) }
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
			forceHref,
			horizontal,
			href,
		} = this.props;

		const classes = classNames(
			'banner',
			className,
			{ 'has-call-to-action': callToAction },
			{ 'is-dismissible': dismissPreferenceName },
			{ 'is-horizontal': horizontal }
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
