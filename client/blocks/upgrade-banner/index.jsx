/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { noop } from 'lodash';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import analytics from 'lib/analytics';
import Button from 'components/button';
import Card from 'components/card';
import Gridicon from 'components/gridicon';

class UpgradeBanner extends Component {

	static propTypes = {
		button: PropTypes.bool,
		callToAction: PropTypes.string,
		callToActionButton: PropTypes.bool,
		className: PropTypes.string,
		color: PropTypes.string,
		description: PropTypes.string,
		event: PropTypes.string,
		href: PropTypes.string,
		icon: PropTypes.string,
		list: PropTypes.arrayOf( PropTypes.string ),
		onClick: PropTypes.func,
		price: PropTypes.string,
		title: PropTypes.string,
	}

	static defaultProps = {
		button: false,
		callToActionButton: false,
		icon: 'star',
		onClick: noop,
	}

	handleClick = () => {
		const { event, onClick } = this.props;
		if ( event ) {
			analytics.tracks.recordEvent( 'calypso_upgrade_banner_cta_click', {
				cta_name: event,
			} );
		}
		onClick();
	}

	bannerContent() {
		const {
			description,
			icon,
			title
		} = this.props;

		return (
			<div className="upgrade-banner__content">
				<Gridicon className="upgrade-banner__icon" icon={ icon } size={ 18 } />
				<div className="upgrade-banner__info">
					<div className="upgrade-banner__title">
						{ title }
					</div>
					<div className="upgrade-banner__description">
						{ description }
					</div>
				</div>
			</div>
		);
	}

	bannerAction() {
		return (
			<div className="upgrade-banner__action"></div>
		);
	}

	render() {
		const {
			button,
			className,
			color,
			href,
		} = this.props;

		const classes = classNames( className, 'upgrade-banner' );

		if ( button ) {
			return (
				<Button
					className={ classes }
					href={ href }
					onClick={ this.handleClick }
				>
					{ this.bannerContent() }
				</Button>
			);
		}

		return (
			<Card
				className={ classes }
				href={ href }
				onClick={ this.handleClick }
				style={ color ? { borderLeftColor: color } : {} }
			>
				{ this.bannerContent() }
				{ this.bannerAction() }
			</Card>
		);
	}

}

export default UpgradeBanner;
