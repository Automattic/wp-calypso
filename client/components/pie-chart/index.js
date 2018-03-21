/** @format */
/**
 * External dependencies
 */
import * as React from 'react';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { pie as d3Pie, arc as d3Arc } from 'd3-shape';

/**
 * Internal dependencies
 */
import D3Base from 'components/d3-base';

class PieChart extends React.Component {
	static propTypes = {
		data: PropTypes.array.isRequired,
		radius: PropTypes.number,
	};

	drawChart() {
		const NUM_COLOR_SECTIONS = 3;
		const { data, radius } = this.props;

		const arcs = d3Pie().value( d => d.value )( data );
		const arcGen = d3Arc()
			.innerRadius( 0 )
			.outerRadius( radius );

		const paths = arcs.map( arc => arcGen( arc ) );

		let sectionNum = -1;
		return (
			<g transform={ `translate(${ radius }, ${ radius })` }>
				{ paths.map( path => {
					sectionNum = ( sectionNum + 1 ) % NUM_COLOR_SECTIONS;
					return <path d={ path } className={ `chart-section-${ sectionNum }` } />;
				} ) }
			</g>
		);
	}

	render() {
		const { radius } = this.props;
		return (
			<div>
				<D3Base width={ radius * 2 } height={ radius * 2 }>
					{ this.drawChart() }
				</D3Base>
			</div>
		);
	}
}

export default localize( PieChart );
