/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import {
	noop,
	size,
} from 'lodash';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import { recordTracksEvent } from 'state/analytics/actions';
import { getValidFeatureKeys } from 'lib/plans';
import { getSelectedSiteSlug } from 'state/ui/selectors';
import Button from 'components/button';
import Card from 'components/card';
import Gridicon from 'components/gridicon';
import PlanIcon from 'components/plans/plan-icon';

class UpgradeBanner extends Component {

	static propTypes = {
		button: PropTypes.bool,
		callToAction: PropTypes.string,
		callToActionButton: PropTypes.bool,
		className: PropTypes.string,
		color: PropTypes.string,
		description: PropTypes.string,
		event: PropTypes.string,
		feature: React.PropTypes.oneOf( [ false, ...getValidFeatureKeys() ] ),
		href: PropTypes.string,
		icon: PropTypes.string,
		list: PropTypes.arrayOf( PropTypes.string ),
		onClick: PropTypes.func,
		plan: PropTypes.string,
		price: PropTypes.string,
		siteSlug: PropTypes.string,
		title: PropTypes.string,
	}

	static defaultProps = {
		button: false,
		callToActionButton: false,
		feature: false,
		icon: 'star',
		onClick: noop,
	}

	handleClick = () => {
		const {
			event,
			feature,
			onClick,
		} = this.props;

		if ( event ) {
			this.props.recordTracksEvent(
				'calypso_upgrade_banner_cta_click', {
					cta_name: event,
					cta_feature: feature,
					cta_size: 'regular'
				} );
		}

		onClick();
	}

	getIcon() {
		const {
			button,
			color,
			icon,
			plan,
		} = this.props;

		if ( plan ) {
			return (
				<div className="upgrade-banner__icon-plan">
					<PlanIcon plan={ plan } />
				</div>
			);
		}

		if ( button ) {
			return (
				<div
					className="upgrade-banner__icon-circle"
					style={ color ? { background: color } : {} }
				>
					<Gridicon icon={ icon } size={ 18 } />
				</div>
			);
		}

		return (
			<div className="upgrade-banner__icons">
				<div
					className="upgrade-banner__icon"
					style={ color ? { color } : {} }
				>
					<Gridicon icon={ icon } size={ 18 } />
				</div>
				<div
					className="upgrade-banner__icon-circle"
					style={ color ? { background: color } : {} }
				>
					<Gridicon icon={ icon } size={ 18 } />
				</div>
			</div>
		);
	}

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

	bannerContent() {
		const {
			button,
			callToAction,
			callToActionButton,
			description,
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
					{ size( list ) > 0 &&
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
									href={ this.getHref() }
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
					href={ this.getHref() }
					onClick={ this.handleClick }
				>
					{ this.getIcon() }
					{ this.bannerContent() }
				</Button>
			);
		}

		return (
			<Card
				className={ classes }
				href={ callToActionButton ? null : this.getHref() }
				onClick={ callToActionButton ? noop : this.handleClick }
				style={ color ? { borderLeftColor: color } : {} }
			>
				{ this.getIcon() }
				{ this.bannerContent() }
			</Card>
		);
	}

}

export default connect(
	state => ( { siteSlug: getSelectedSiteSlug( state ) } ),
	{ recordTracksEvent }
)( UpgradeBanner );
