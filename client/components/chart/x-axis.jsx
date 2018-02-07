/** @format */
/**
 * External dependencies
 */
import * as React from 'react';
import PropTypes from 'prop-types';
import { throttle } from 'lodash';

/**
 * Internal dependencies
 */
import Label from './label';

export class XAxis extends React.PureComponent {
	static propTypes = {
		labelWidth: PropTypes.number.isRequired,
		data: PropTypes.array.isRequired,
	};

	state = {
		divisor: 1,
		spacing: this.props.labelWidth,
	};

	componentDidMount() {
		this.resizeThrottled = throttle( this.resize, 400 );
		window.addEventListener( 'resize', this.resizeThrottled );
		this.resize();
	}

	componentWillUnmount() {
		window.removeEventListener( 'resize', this.resizeThrottled );
	}

	componentWillReceiveProps( nextProps ) {
		this.resize( nextProps );
	}

	resize = nextProps => {
		const node = this.axis;
		if ( ! node ) {
			return;
		}

		const props = nextProps && ! ( nextProps instanceof Event ) ? nextProps : this.props;

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

		this.setState( { divisor, spacing } );
	};

	storeAxis = ref => ( this.axis = ref );

	render() {
		const { data, labelWidth } = this.props;
		const { divisor, spacing } = this.state;

		return (
			<div ref={ this.storeAxis } className="chart__x-axis">
				{ data.map( ( item, index ) => {
					const x = index * spacing + ( spacing - labelWidth ) / 2;
					const rightIndex = data.length - index - 1;
					const hasLabel = rightIndex % divisor === 0;

					return (
						hasLabel && <Label key={ index } label={ item.label } width={ labelWidth } x={ x } />
					);
				} ) }
			</div>
		);
	}
}

export default XAxis;
