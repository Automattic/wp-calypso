/**
 * External dependencies
 */
import React from 'react';
import Gridicon from 'components/gridicon';

import analytics from 'lib/analytics';
import store from 'store';
import userUtils from 'lib/user/utils';
import viewport from 'lib/viewport';

export default React.createClass( {

	displayName: 'AppPromo',

	propTypes: {
		location: React.PropTypes.string.isRequired
	},

	getInitialState: function() {
		var show_promo = true;

		if ( store.get( 'desktop_promo_dismissed' ) ) {
			show_promo = false;
		}

		if ( userUtils.getLocaleSlug() !== 'en' ) {
			show_promo = false;
		}

		if ( viewport.isMobile() ) {
			show_promo = false;
		}

		const chromeRE = /\bCrOS\b/;
		if ( chromeRE.test( navigator.userAgent ) ) {
			show_promo = false;
		}

		var promo_options = [
			{ promo_code: 'a0001', message: 'WordPress.com your way  — desktop app now available for Mac, Windows, and Linux.' },
			{ promo_code: 'a0002', message: 'Get WordPress.com app for your desktop.' },
			{ promo_code: 'a0003', message: 'WordPress.com app now available for desktop.' },
			{ promo_code: 'a0005', message: 'WordPress.com at your fingertips — download app for desktop.' }
		];

		var item = promo_options[Math.floor( Math.random() * promo_options.length )];
		return {
			promo_item: item,
			show_promo: show_promo
		};
	},

	componentDidMount: function() {
		// record promo view event
		if ( this.state.show_promo ) {
			analytics.tracks.recordEvent( 'calypso_desktop_promo_view', { promo_location: this.props.location, promo_code: this.state.promo_item.promo_code } );
		}
	},

	recordClickEvent: function() {
		analytics.tracks.recordEvent( 'calypso_desktop_promo_click', { promo_location: this.props.location, promo_code: this.state.promo_item.promo_code } );
	},

	dismiss: function() {
		this.setState( { show_promo: false } );

		// store as dismissed
		store.set( 'desktop_promo_dismissed', true );
	},

	render: function() {
		if ( ! this.state.show_promo ) {
			return null;
		}

		var promo_link = 'https://apps.wordpress.com/desktop/?ref=promo_' + this.props.location + '_' + this.state.promo_item.promo_code;
		var element = (
			<div className="app-promo">
				<span tabIndex="0" className="app-promo__dismiss" onClick={ this.dismiss } >
					<Gridicon icon="cross" size={ 24 } />
					<span className="screen-reader-text">{ this.translate( 'Dismiss' ) }</span>
				</span>
				<a onClick={ this.recordClickEvent } className="app-promo__link" title="Try the desktop app!" href={ promo_link } target="_blank">
					<img className="app-promo__icon" src="/calypso/images/reader/promo-app-icon.png" width="32" height="32" alt="WordPress Desktop Icon" />
					{ this.state.promo_item.message }
				</a>
			</div>
		);

		return element;
	}
} );
