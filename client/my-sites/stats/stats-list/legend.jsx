/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React from 'react';

/**
 * Internal dependencies
 */

export default class extends React.PureComponent {
	static displayName = 'StatsListLegend';

	static propTypes = {
		value: PropTypes.string,
		label: PropTypes.string,
	};

	render() {
		const { value, label } = this.props;

		let valueSpan;

		if ( value ) {
			valueSpan = (
				<span className="module-content-list-item-right">
					<span className="module-content-list-item-value">{ value }</span>
				</span>
			);
		}

		return (
			<ul className="module-content-list module-content-list-legend">
				<li className="module-content-list-item">
					<span className="module-content-list-item-wrapper">
						{ valueSpan }
						<span className="module-content-list-item-label">{ label }</span>
					</span>
				</li>
			</ul>
		);
	}
}
