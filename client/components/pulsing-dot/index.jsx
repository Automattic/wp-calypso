/** @format */

/**
 * External dependencies
 */

import React from 'react';
import { number } from 'prop-types';
import classnames from 'classnames';

class PulsingDot extends React.Component {
	constructor( props ) {
		super( props );

		this.timeout = null;
		this.state = {
			show: false,
		};
	}

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

		const className = classnames( 'pulsing-dot', { 'is-active': active } );
		return show ? <div className={ className } /> : null;
	}
}

PulsingDot.propTypes = {
	delay: number.isRequired,
};

PulsingDot.defaultProps = {
	delay: 0,
};

export default PulsingDot;
