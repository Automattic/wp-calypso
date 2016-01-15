/**
 * External dependencies
 */
import React from 'react';
import assign from 'lodash/object/assign';
import classNames from 'classnames';
import noop from 'lodash/utility/noop';
import Gridicon from 'components/gridicon';

import analytics from 'analytics';
import store from 'store';

export default React.createClass( {

	displayName: 'AppPromo',

	getInitialState: function() {
		var has_dismissed = store.get('desktop_promo_dismissed');
		var promo_options = [
			{ promo_code: 'a0001', message: 'WordPress.com your way  — apps now available in three delicious flavors — desktop, iOS, and Android.' },
			{ promo_code: 'a0002', message: 'Get WordPress.com apps for desktop and mobile: download now!' },
		    { promo_code: 'a0003', message: 'WordPress.com apps now available for desktop and mobile: download now!' },
			{ promo_code: 'a0004', message: 'WordPress.com wherever you are — apps now available for desktop and mobile.' },
			{ promo_code: 'a0005', message: 'WordPress.com at your fingertips — download apps for desktop and mobile.' },
			{ promo_code: 'a0006', message: 'Blog anywhere, any time: download WordPress.com apps for desktop and mobile.' }
		];

		var item = promo_options[Math.floor(Math.random()*promo_options.length)];
		return {
			promo_item: item,
			dismissed: has_dismissed
		};
	},

	componentDidMount: function() {
		// record promo view event
		if (!this.state.dismissed ) {
			analytics.tracks.recordEvent( 'calypso_desktop_promo_write_view', { 'promo_code': this.state.promo_item.promo_code } );
		}
	},

	dismiss: function() {
		this.setState( { dismissed: true } );

		// store as dismissed
		store.set('desktop_promo_dismissed', true);
	},

	render() {
		if ( this.state.dismissed ) {
			return null;
		}

		var classes = classNames( 'app-promo', {
			'dismissed': false
		} ), element;

		var promo_link = "https://wordpress.com/me/get-apps?ref=promo_write_" + this.state.promo_item.promo_code;
		element = (
			<div className={ classes }>
				<span tabIndex="0" className="app-promo__dismiss" onClick={ this.dismiss } >
					<Gridicon icon="cross" size={ 24 } />
					<span className="screen-reader-text">{ this.translate( 'Dismiss' ) }</span>
				</span>
				<a className="app-promo__link" title="Try the desktop app!" href={promo_link} target="_blank">
					<img className="app-promo__icon" src="https://s0.wp.com/wp-content/themes/a8c/desktop/i/icon.png" width="32" height="32" alt="WordPress Desktop Icon" /> 
					{this.state.promo_item.message}
				</a>
			</div>
		);

		return element;
	}
} );
