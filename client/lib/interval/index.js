import React, { PropTypes } from 'react';
import omit from 'lodash/object/omit';

import {
	add, remove,
	EVERY_SECOND,
	EVERY_FIVE_SECONDS,
	EVERY_TEN_SECONDS,
	EVERY_THIRTY_SECONDS,
	EVERY_MINUTE
} from './runner';

export {
	EVERY_SECOND,
	EVERY_FIVE_SECONDS,
	EVERY_TEN_SECONDS,
	EVERY_THIRTY_SECONDS,
	EVERY_MINUTE
};

/**
 * Calls a given function on a given interval
 */
export default React.createClass( {
	displayName: 'Interval',

	propTypes: {
		onTick: PropTypes.func.isRequired,
		period: PropTypes.oneOf( [
			EVERY_SECOND,
			EVERY_FIVE_SECONDS,
			EVERY_TEN_SECONDS,
			EVERY_THIRTY_SECONDS,
			EVERY_MINUTE
		] ).isRequired,
		pauseWhenHidden: PropTypes.bool,
		children: PropTypes.element
	},

	getDefaultProps: () => ( {
		pauseWhenHidden: true
	} ),

	getInitialState: () => ( {
		id: null
	} ),

	componentDidMount() {
		this.start();

		document.addEventListener( 'visibilitychange', this.handleVisibilityChange, false );
	},

	componentWillUnmount() {
		document.removeEventListener( 'visibilitychange', this.handleVisibilityChange, false );

		this.stop();
	},

	componentDidUpdate( prevProps ) {
		if ( prevProps.period === this.props.period && prevProps.onTick === this.props.onTick ) {
			return;
		}

		this.start();
	},

	handleVisibilityChange() {
		const { id } = this.state;
		const { pauseWhenHidden } = this.props;

		if ( document.hidden && id && pauseWhenHidden ) {
			return this.stop();
		}

		if ( ! document.hidden && ! id && pauseWhenHidden ) {
			this.start();
		}
	},

	start() {
		const { period, onTick } = this.props;

		if ( this.state.id ) {
			remove( this.state.id );
		}
		this.setState( { id: add( period, onTick ) } );
	},

	stop() {
		remove( this.state.id );
		this.setState( { id: null } );
	},

	render() {
		return this.props.children ? React.cloneElement( this.props.children, omit( this.props, [ 'onTick', 'period', 'pauseWhenHidden', 'children' ] ) ) : null;
	}
} );
