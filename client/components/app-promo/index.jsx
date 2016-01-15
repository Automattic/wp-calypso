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
		return {
			dismissed: has_dismissed
		};
	},

	componentDidMount: function() {
		// record promo view event
		if (!this.state.dismissed ) {
			analytics.tracks.recordEvent( 'calypso_desktop_promo_write_view', { 'promo_code': 'a0001' } );
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


		element = (
			<div className={ classes }>
				<span tabIndex="0" className="app-promo__dismiss" onClick={ this.dismiss } >
					<Gridicon icon="cross" size={ 24 } />
					<span className="screen-reader-text">{ this.translate( 'Dismiss' ) }</span>
				</span>
				<a className="app-promo__link" title="Try the desktop app!" href="https://desktop.wordpress.com" target="_blank">
					<img className="app-promo__icon" src="https://s0.wp.com/wp-content/themes/a8c/desktop/i/icon.png" width="32" height="32" alt="WordPress Desktop Icon" /> Manage all your WordPress.com and Jetpack-enabled sites in one place
				</a>
			</div>
		);

		return element;
	}
} );
