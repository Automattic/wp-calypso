/**
 * External dependencies
 */
import { connect } from 'react-redux';
import { debounce } from 'lodash';
import React from 'react';
import debugFactory from 'debug';

/**
 * Internal dependencies
 */
import { setViewportWidth } from 'state/ui/actions';
import { getWindowInnerWidth } from 'lib/viewport';

class ViewportWatcher extends React.Component {
	componentWillMount() {
		if ( global.window ) {
			this.props.setViewportWidth( getWindowInnerWidth() );
			global.window.addEventListener( 'resize', this.throttledResizeHandler );
		}
	}

	componentWillUnmount() {
		if ( global.window ) {
			global.window.removeEventListener( 'resize', this.throttledResizeHandler );
		}
	}

	handleResize = () => {
		this.props.setViewportWidth( getWindowInnerWidth() );
	}

	throttledResizeHandler = debounce( this.handleResize, 50 );

	render() {
		return null;
	}
}

export default connect( null, { setViewportWidth } )( ViewportWatcher );
