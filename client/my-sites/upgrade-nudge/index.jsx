/**
 * External dependencies
 */
import React from 'react';
import classNames from 'classnames';
import noop from 'lodash/noop';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import Card from 'components/card';
import Gridicon from 'components/gridicon';
import analytics from 'analytics';
import sitesList from 'lib/sites-list';

const sites = sitesList();

export default React.createClass( {

	displayName: 'UpgradeNudge',

	propTypes: {
		onClick: React.PropTypes.func,
		className: React.PropTypes.string,
		message: React.PropTypes.string,
		icon: React.PropTypes.string,
		event: React.PropTypes.string,
		href: React.PropTypes.string,
		jetpack: React.PropTypes.bool,
		compact: React.PropTypes.bool,
		feature: React.PropTypes.oneOf( [
			false,
			'google-analytics',
			'domain',
			'premium-theme',
			'custom-css'
		] ),
	},

	getDefaultProps() {
		return {
			onClick: noop,
			message: 'And get your own domain address.',
			icon: 'star',
			event: null,
			jetpack: false,
			feature: false,
			compact: false
		}
	},

	handleClick() {
		if ( this.props.event || this.props.feature ) {
			analytics.tracks.recordEvent( 'calypso_upgrade_nudge_cta_click', {
				cta_name: this.props.event,
				cta_feature: this.props.feature
			} );
		}
		this.props.onClick();
	},

	componentDidMount() {
		if ( this.props.event || this.props.feature ) {
			analytics.tracks.recordEvent( 'calypso_upgrade_nudge_impression', {
				cta_name: this.props.event,
				cta_feature: this.props.feature
			} );
		}
	},

	render() {
		const classes = classNames( this.props.className, 'upgrade-nudge' );

		const site = sites.getSelectedSite();
		let href = this.props.href;

		if ( site && site.plan && site.plan.product_name_short !== 'Free' ) {
			return null;
		}

		if ( ! this.props.jetpack && site.jetpack || this.props.jetpack && ! site.jetpack ) {
			return null;
		}

		if ( ! this.props.href && site ) {
			href = '/plans/';

			if ( this.props.feature ) {
				href += 'features/' + this.props.feature + '/';
			}
			href += site.slug;
		}

		if ( this.props.compact ) {
			return (
				<Button className={ classes } onClick={ this.handleClick } href={ href }>
					<Gridicon className="upgrade-nudge__icon" icon={ this.props.icon } />
					<div className="upgrade-nudge__info">
						<span className="upgrade-nudge__title">
							{ this.props.title || this.translate( 'Upgrade to Premium' ) }
						</span>
						<span className="upgrade-nudge__message" >
							{ this.props.message }
						</span>
					</div>
				</Button>
			);
		}

		return (
			<Card compact className={ classes } onClick={ this.handleClick } href={ href }>
				<Gridicon className="upgrade-nudge__icon" icon={ this.props.icon } />
				<div className="upgrade-nudge__info">
					<span className="upgrade-nudge__title">
						{ this.props.title || this.translate( 'Upgrade to Premium' ) }
					</span>
					<span className="upgrade-nudge__message" >
						{ this.props.message }
					</span>
				</div>
			</Card>
		);
	}
} );
