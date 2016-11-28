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
		const {
			event,
			href,
			onClick,
		} = this.props;

		if ( event ) {
			analytics.tracks.recordEvent( 'calypso_upgrade_banner_cta_click', {
				cta_name: event,
			} );
		}

		onClick();

		if ( href ) {
			window.location.href( href );
		}
	}

	bannerContent() {
		const {
			button,
			callToAction,
			callToActionButton,
			description,
			href,
			list,
			title
		} = this.props;

		return (
			<div className="upgrade-banner__content">
				<div className="upgrade-banner__info">
					<div className="upgrade-banner__title">
						{ title }
					</div>
					{ description &&
						<div className="upgrade-banner__description">
							{ description }
						</div>
					}
					{ list &&
						<ul className="upgrade-banner__list">
							{ list.map( ( item, key ) =>
								<li key={ key }>
									<Gridicon icon="checkmark" size={ 18 } />
									{ item }
								</li>
							) }
						</ul>
					}
				</div>
				{ ! button &&
					<div className="upgrade-banner__action">
						{ callToActionButton
							? <Button
									compact
									href={ href }
									onClick={ this.handleClick }
									primary
								>
									{ callToAction }
								</Button>
							: callToAction }
					</div>
				}
			</div>
		);
	}

	render() {
		const {
			button,
			callToActionButton,
			className,
			color,
			href,
			icon,
		} = this.props;

		const classes = classNames(
			'upgrade-banner',
			className,
			{ 'has-call-to-action-button': callToActionButton }
		);

		if ( button ) {
			return (
				<Button
					className={ classes }
					href={ href }
					onClick={ this.handleClick }
				>
					<div
						className="upgrade-banner__icon-circle"
						style={ color ? { background: color } : {} }
					>
						<Gridicon
							icon={ icon }
							size={ 18 }
						/>
					</div>
					{ this.bannerContent() }
				</Button>
			);
		}

		return (
			<Card
				className={ classes }
				href={ callToActionButton ? null : href }
				onClick={ callToActionButton ? noop : this.handleClick }
				style={ color ? { borderLeftColor: color } : {} }
			>
				<div
					className="upgrade-banner__icon"
					style={ color ? { color } : {} }
				>
					<Gridicon
						icon={ icon }
						size={ 18 }
					/>
				</div>
				<div
					className="upgrade-banner__icon-circle"
					style={ color ? { background: color } : {} }
				>
					<Gridicon
						icon={ icon }
						size={ 18 }
					/>
				</div>
				{ this.bannerContent() }
			</Card>
		);
	}

}

export default UpgradeBanner;
