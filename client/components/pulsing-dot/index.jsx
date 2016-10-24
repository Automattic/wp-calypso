/**
 * External dependencies
 */
var React = require( 'react' ),
	classnames = require( 'classnames' );

/**
 * Internal dependencies
 */
var analytics = require( 'lib/analytics' );

var PulsingDot = React.createClass( {

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
		var className = classnames( {
			'pulsing-dot': true,
			'is-active': this.props.active
		} );
		return (
			<div className={ className } />
		);
	}

} );

module.exports = PulsingDot;
