/**
 * External dependencies
 */
import classnames from 'classnames';
import React from 'react';

/**
 * Internal dependencies
 */
import analytics from 'lib/analytics';

const PulsingDot = React.createClass( {

	getDefaultProps: function() {
		return {
			active: false
		};
	},

	_loadingStatTimeout: null,

	componentWillUnmount: function() {
		if ( this._loadingStatTimeout ) {
			clearTimeout( this._loadingStatTimeout );
			this._loadingStatTimeout = null;
		}
	},

	componentWillReceiveProps: function( nextProps ) {
		if ( nextProps.active === this.props.active || ! this.props.chunkName ) {
			return;
		}

		if ( nextProps.active ) {
			this._loadingStatTimeout = setTimeout( () => {
				analytics.mc.bumpStat( 'calypso_chunk_waiting', this.props.chunkName );
			}, 400 );
		} else {
			clearTimeout( this._loadingStatTimeout );
			this._loadingStatTimeout = null;
		}
	},

	render: function() {
		const className = classnames( {
			'pulsing-dot': true,
			'is-active': this.props.active
		} );
		return (
			<div className={ className } />
		);
	}

} );

export default PulsingDot;
