/** @format */
/**
 * External dependencies
 */
import * as React from 'react';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';

const COLOR_SAMPLE_SIZE = 20;

class LegendItem extends React.Component {
	static propTypes = {
		name: PropTypes.string.isRequired,
		sectionNumber: PropTypes.number.isRequired,
		value: PropTypes.number.isRequired,
		description: PropTypes.string,
		percent: PropTypes.number,
	};

	render() {
		const { name, sectionNumber, value, percent, description } = this.props;
		return (
			<div className={ 'pie-chart__legend-item' }>
				<svg
					height={ COLOR_SAMPLE_SIZE }
					width={ COLOR_SAMPLE_SIZE }
					viewBox={ `0 0 ${ COLOR_SAMPLE_SIZE } ${ COLOR_SAMPLE_SIZE }` }
					className={ 'pie-chart__legend-item-sample' }
				>
					<circle
						className={ `pie-chart__legend-sample-${ sectionNumber }` }
						cx={ COLOR_SAMPLE_SIZE / 2 }
						cy={ COLOR_SAMPLE_SIZE / 2 }
						r={ COLOR_SAMPLE_SIZE / 2 }
					/>
				</svg>
				<div className={ 'pie-chart__legend-item-detail' }>
					<div className={ 'pie-chart__legend-item-detail-name' }>{ name }</div>
					<p className={ 'pie-chart__legend-item-detail-value' }>
						{ percent ? `${ value } (${ percent })` : `${ value }` }
					</p>
					{ description ? (
						<p className={ 'pie-chart__legend-item-detail-description' }>{ description }</p>
					) : (
						''
					) }
				</div>
			</div>
		);
	}
}

export default localize( LegendItem );
