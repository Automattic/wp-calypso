/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React from 'react';

export default class ChartLegendItem extends React.PureComponent {
	static propTypes = {
		attr: PropTypes.string.isRequired,
		changeHandler: PropTypes.func.isRequired,
		checked: PropTypes.bool.isRequired,
		label: PropTypes.oneOfType( [ PropTypes.object, PropTypes.string ] ),
	};

	clickHandler = () => {
		this.props.changeHandler( this.props.attr );
	};

	render() {
		return (
			<li className="chart__legend-option">
				<label className="chart__legend-label is-selectable">
					<input
						checked={ this.props.checked }
						className="chart__legend-checkbox"
						onChange={ this.clickHandler }
						type="checkbox"
					/>
					<span className={ this.props.className } />
					{ this.props.label }
				</label>
			</li>
		);
	}
}
