import clsx from 'clsx';
import { omit } from 'lodash';
import PropTypes from 'prop-types';
import { Component } from 'react';
import FormRange from 'calypso/components/forms/form-range';

import './style.scss';

export default class extends Component {
	static displayName = 'Range';

	static propTypes = {
		minContent: PropTypes.node,
		maxContent: PropTypes.node,
		min: PropTypes.oneOfType( [ PropTypes.string, PropTypes.number ] ),
		max: PropTypes.oneOfType( [ PropTypes.string, PropTypes.number ] ),
		value: PropTypes.oneOfType( [ PropTypes.string, PropTypes.number ] ),
		showValueLabel: PropTypes.bool,
	};

	static defaultProps = {
		min: 0,
		max: 10,
		value: 0,
		showValueLabel: false,
	};

	state = {
		id: 'range' + crypto.randomUUID(),
	};

	getMinContentElement = () => {
		if ( this.props.minContent ) {
			return <span className="range__content is-min">{ this.props.minContent }</span>;
		}
	};

	getMaxContentElement = () => {
		if ( this.props.maxContent ) {
			return <span className="range__content is-max">{ this.props.maxContent }</span>;
		}
	};

	getValueLabelElement = () => {
		let left;
		let offset;

		if ( this.props.showValueLabel ) {
			left = ( 100 * ( this.props.value - this.props.min ) ) / ( this.props.max - this.props.min );

			// The center of the slider thumb is not aligned to the same
			// percentage stops as an absolute positioned element will be.
			// Therefore, we adjust based on the thumb's position relative to
			// its own size. Ideally, we would use `getComputedStyle` here,
			// but this method doesn't support the thumb pseudo-element in all
			// browsers. The multiplier is equal to half of the thumb's width.
			//
			// Normal:
			// v        v        v
			// |( )----( )----( )|
			//
			// Adjusted:
			//   v      v      v
			// |( )----( )----( )|
			offset = Math.floor( 13 * ( ( 50 - left ) / 50 ) ); // 26px / 2 = 13px

			return (
				<span className="range__label" style={ { left: ( left || 0 ) + '%', marginLeft: offset } }>
					<output
						className="range__label-inner"
						htmlFor={ this.state.id }
						value={ this.props.value }
					>
						{ this.props.value }
					</output>
				</span>
			);
		}
	};

	render() {
		const classes = clsx( this.props.className, 'range', {
			'has-min-content': !! this.props.minContent,
			'has-max-content': !! this.props.maxContent,
		} );

		return (
			<div className={ classes }>
				{ this.getMinContentElement() }
				<FormRange
					id={ this.state.id }
					className="range__input"
					{ ...omit( this.props, 'minContent', 'maxContent', 'showValueLabel', 'className' ) }
				/>
				{ this.getMaxContentElement() }
				{ this.getValueLabelElement() }
			</div>
		);
	}
}
