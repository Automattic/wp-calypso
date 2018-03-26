/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { isRtl as isRtlSelector } from 'state/selectors';

class ModuleChartLabel extends React.Component {
	static propTypes = {
		width: PropTypes.number.isRequired,
		x: PropTypes.number.isRequired,
		label: PropTypes.string.isRequired,
	};

	render() {
		const { isRtl } = this.props;

		const dir = isRtl ? 'right' : 'left';
		const labelStyle = {
			width: this.props.width + 'px',
		};

		labelStyle[ dir ] = this.props.x + 'px';

		return (
			<div className="chart__x-axis-label" style={ labelStyle }>
				{ this.props.label }
			</div>
		);
	}
}

export default connect( state => ( { isRtl: isRtlSelector( state ) } ) )( ModuleChartLabel );
