/** @format */

/**
 * External dependencies
 */

import React from 'react';

/**
 * Style dependencies
 */
import './style.scss';

export default class extends React.Component {
	static displayName = 'FeatureExample';

	render() {
		return (
			<div className="feature-example">
				<div className="feature-example__content">{ this.props.children }</div>
				<div className="feature-example__gradient" />
			</div>
		);
	}
}
