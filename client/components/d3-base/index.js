/** @format */

/**
 * External dependencies
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';

export default class D3Base extends Component {
	static propTypes = {
		width: PropTypes.number.isRequired,
		height: PropTypes.number.isRequired,
	};

	render() {
		const { width, height } = this.props;
		return (
			<svg
				width={ width }
				height={ height }
				viewBox={ `0 0 ${ width } ${ height }` }
				preserveAspectRatio={ 'xMidYMid meet' }
			>
				{ this.props.children }
			</svg>
		);
	}
}
