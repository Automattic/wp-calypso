/** @format */

/**
 * External dependencies
 */

import React from 'react';
import classnames from 'classnames';

/**
 * Internal dependencies
 */
import analytics from 'lib/analytics';

class PulsingDot extends React.Component {
	static defaultProps = {
		active: false,
	};

	_loadingStatTimeout = null;

	componentWillUnmount() {
		if ( this._loadingStatTimeout ) {
			clearTimeout( this._loadingStatTimeout );
			this._loadingStatTimeout = null;
		}
	}

	componentWillReceiveProps( nextProps ) {
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
	}

	render() {
		var className = classnames( {
			'pulsing-dot': true,
			'is-active': this.props.active,
		} );
		return <div className={ className } />;
	}
}

export default PulsingDot;
