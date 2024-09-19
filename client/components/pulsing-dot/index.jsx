import clsx from 'clsx';
import { number } from 'prop-types';
import { Component } from 'react';

import './style.scss';

class PulsingDot extends Component {
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

		const className = clsx( 'pulsing-dot', { 'is-active': active } );
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
