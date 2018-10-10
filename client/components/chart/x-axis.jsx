/** @format */

/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React from 'react';
import { numberFormat } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import afterLayoutFlush from 'lib/after-layout-flush';
import Label from './label';

export default class ChartXAxis extends React.PureComponent {
	static displayName = 'ModuleChartXAxis';

	static propTypes = {
		data: PropTypes.array.isRequired,
		isRtl: PropTypes.bool,
		labelWidth: PropTypes.number.isRequired,
	};

	axisRef = React.createRef();
	axisSpacerRef = React.createRef();

	state = {
		divisor: 1,
		spacing: this.props.labelWidth,
	};

	// Add listener for window resize
	componentDidMount() {
		this.resize = afterLayoutFlush( this.resize );
		window.addEventListener( 'resize', this.resize );
		this.resize();
	}

	// Remove listener
	componentWillUnmount() {
		if ( this.resize.cancel ) {
			this.resize.cancel();
		}
		window.removeEventListener( 'resize', this.resize );
	}

	componentDidUpdate() {
		this.resize();
	}

	resize = () => {
		const width = this.axisRef.current.clientWidth - this.axisSpacerRef.current.clientWidth;
		const dataCount = this.props.data.length || 1;
		const spacing = width / dataCount;
		const labelWidth = this.props.labelWidth;
		const divisor = Math.ceil( labelWidth / spacing );

		this.setState( { divisor, spacing } );
	};

	render() {
		const data = this.props.data;

		const labels = data.map( function( item, index ) {
			const x = index * this.state.spacing + ( this.state.spacing - this.props.labelWidth ) / 2,
				rightIndex = data.length - index - 1;
			let label;

			if ( rightIndex % this.state.divisor === 0 ) {
				label = (
					<Label
						isRtl={ this.props.isRtl }
						key={ index }
						label={ item.label }
						width={ this.props.labelWidth }
						x={ x }
					/>
				);
			}

			return label;
		}, this );

		return (
			<div ref={ this.axisRef } className="chart__x-axis">
				{ labels }
				<div ref={ this.axisSpacerRef } className="chart__x-axis-label chart__x-axis-width-spacer">
					{ numberFormat( 100000 ) }
				</div>
			</div>
		);
	}
}
