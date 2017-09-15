/**
 * External dependencies
 */
import PropTypes from 'prop-types';

import React from 'react';
import { throttle } from 'lodash';

/**
 * Internal dependencies
 */
import Label from './label';

module.exports = React.createClass( {
	displayName: 'ModuleChartXAxis',

	propTypes: {
		labelWidth: PropTypes.number.isRequired,
		data: PropTypes.array.isRequired
	},

	getInitialState: function() {
		return {
			divisor: 1,
			spacing: this.props.labelWidth
		};
	},

	// Add listener for window resize
	componentDidMount: function() {
		this.resizeThrottled = throttle( this.resize, 400 );
		window.addEventListener( 'resize', this.resizeThrottled );
		this.resize();
	},

	// Remove listener
	componentWillUnmount: function() {
		if ( this.resizeThrottled.cancel ) {
			this.resizeThrottled.cancel();
		}
		window.removeEventListener( 'resize', this.resizeThrottled );
	},

	componentWillReceiveProps: function( nextProps ) {
		this.resize( nextProps );
	},

	resize: function( nextProps ) {
		let props = this.props;
		if ( nextProps && ! ( nextProps instanceof Event ) ) {
			props = nextProps;
		}

		const node = this.refs.axis;

		/**
		 * Overflow needs to be hidden to calculate the desired width,
		 * but visible to display each labels' overflow :/
		 */

		node.style.overflow = 'hidden';
		const width = node.clientWidth;
		node.style.overflow = 'visible';

		const dataCount = props.data.length || 1;
		const spacing = width / dataCount;
		const labelWidth = props.labelWidth;
		const divisor = Math.ceil( labelWidth / spacing );

		this.setState( {
			divisor: divisor,
			spacing: spacing
		} );
	},

	render: function() {
		const data = this.props.data;

		const labels = data.map( function( item, index ) {
			const x = ( index * this.state.spacing ) + ( ( this.state.spacing - this.props.labelWidth ) / 2 ),
				rightIndex = data.length - index - 1;
			let label;

			if ( rightIndex % this.state.divisor === 0 ) {
				label = <Label key={ index } label={ item.label } width={ this.props.labelWidth } x={ x } />;
			}

			return label;
		}, this );

		return (
			<div ref="axis" className="chart__x-axis">{ labels }</div>
		);
	}
} );
