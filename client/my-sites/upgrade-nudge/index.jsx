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
		jetpack: React.PropTypes.bool
	},

	getDefaultProps() {
		return {
			onClick: noop,
			message: 'And get your own domain address.',
			icon: 'star',
			event: null,
			jetpack: false
		}
	},

	handleClick() {
		if ( this.props.event ) {
			analytics.tracks.recordEvent( 'calypso_upgrade_nudge_cta_click', {
				cta_name: this.props.event
			} );
		}
		this.props.onClick();
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
			href = '/plans/' + site.slug;
		}

		return (
			<Button className={ classes } onClick={ this.handleClick } href={ href }>
				<div className="upgrade-nudge__info">
					<span className="upgrade-nudge__title">
						{ this.props.title || this.translate( 'Upgrade to Premium' ) }
					</span>
					<span className="upgrade-nudge__message" >
						{ this.props.message }
					</span>
				</div>
				<Gridicon icon={ this.props.icon } />
			</Button>
		);
	}
} );
