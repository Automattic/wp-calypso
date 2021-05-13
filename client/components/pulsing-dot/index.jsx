/**
 * External dependencies
 */

import React from 'react';
import { number } from 'prop-types';
import classnames from 'classnames';

/**
 * Style dependencies
 */
import './style.scss';

class PulsingDot extends React.Component {
	timeout = null;

	state = {
		show: false,
	};

	componentDidMount() {
		const { delay } = this.props;

		this.timeout = setTimeout( () => {
			this.setState( { show: true } );
		}, delay );
	}

	componentWillUnmount() {
		if ( this.timeout ) {
			clearTimeout( this.timeout );
		}
	}

	render() {
		const { active } = this.props;
		const { show } = this.state;

		if ( ! show ) {
			return null;
		}

		const className = classnames( 'pulsing-dot', { 'is-active': active } );
		return <div className={ className } />;
	}
}

PulsingDot.propTypes = {
	delay: number.isRequired,
};

PulsingDot.defaultProps = {
	delay: 0,
};

export default PulsingDot;
