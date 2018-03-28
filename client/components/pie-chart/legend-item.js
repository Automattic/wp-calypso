/**
 * External dependencies
 */
import * as React from 'react';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';

class LegendItem extends React.Component {

	static propTypes = {
		name: PropTypes.string.isRequired,
		sectionNumber: PropTypes.number.isRequired,
		value: PropTypes.number.isRequired,
		description: PropTypes.string,
		percent: PropTypes.number,
	};

	render() {
		const { name, sectionNumber } = this.props;
		return (
			<div className={ `pie-chart__legend-item-${ sectionNumber }` } >
				{ name }
			</div>
		);
	}
}

export default localize( LegendItem );
