/** @format */

/**
 * External dependencies
 */

/**
 * External dependencies
 */
import { Component } from 'react';
import PropTypes from 'prop-types';

export const EVERY_SECOND = 1000;
export const EVERY_FIVE_SECONDS = 5 * 1000;
export const EVERY_TEN_SECONDS = 10 * 1000;
export const EVERY_THIRTY_SECONDS = 30 * 1000;
export const EVERY_MINUTE = 60 * 1000;

/**
 * Calls a given function on a given interval
 */
export default class Interval extends Component {
	static propTypes = {
		onTick: PropTypes.func.isRequired,
		period: PropTypes.oneOf( [
			EVERY_SECOND,
			EVERY_FIVE_SECONDS,
			EVERY_TEN_SECONDS,
			EVERY_THIRTY_SECONDS,
			EVERY_MINUTE,
		] ).isRequired,
	};

	tick = () => {
		this.props.onTick();
	};

	start = ( props = this.props ) => {
		this.interval = setInterval( this.tick, props.period );
	};

	stop = () => {
		this.interval = clearInterval( this.interval );
	};

	componentDidMount() {
		this.start();
	}

	componentWillUnmount() {
		this.stop();
	}

	componentWillReceiveProps( nextProps ) {
		if ( nextProps.period !== this.props.period ) {
			this.stop();
			this.start( nextProps );
		}
	}

	render() {
		return null;
	}
}
