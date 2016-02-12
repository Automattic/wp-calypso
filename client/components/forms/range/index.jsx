/**
 * External dependencies
 */
var React = require( 'react' ),
	omit = require( 'lodash/omit' ),
	classnames = require( 'classnames' ),
	uniqueId = require( 'lodash/uniqueId' );

/**
 * External dependencies
 */
var FormRange = require( 'components/forms/form-range' );

module.exports = React.createClass( {
	displayName: 'Range',

	propTypes: {
		minContent: React.PropTypes.oneOfType( [ React.PropTypes.element, React.PropTypes.string ] ),
		maxContent: React.PropTypes.oneOfType( [ React.PropTypes.element, React.PropTypes.string ] ),
		min: React.PropTypes.oneOfType( [ React.PropTypes.string, React.PropTypes.number ] ),
		max: React.PropTypes.oneOfType( [ React.PropTypes.string, React.PropTypes.number ] ),
		value: React.PropTypes.oneOfType( [ React.PropTypes.string, React.PropTypes.number ] ),
		showValueLabel: React.PropTypes.bool
	},

	getInitialState: function() {
		return {
			id: uniqueId( 'range' )
		};
	},

	getDefaultProps: function() {
		return {
			min: 0,
			max: 10,
			value: 0,
			showValueLabel: false
		};
	},

	getMinContentElement: function() {
		if ( this.props.minContent ) {
			return <span className="range__content is-min">{ this.props.minContent }</span>;
		}
	},

	getMaxContentElement: function() {
		if ( this.props.maxContent ) {
			return <span className="range__content is-max">{ this.props.maxContent }</span>;
		}
	},

	getValueLabelElement: function() {
		var left, offset;

		if ( this.props.showValueLabel ) {
			left = 100 * ( this.props.value - this.props.min ) / ( this.props.max - this.props.min );

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
					<output className="range__label-inner" htmlFor={ this.state.id } value={ this.props.value }>{ this.props.value }</output>
				</span>
			);
		}
	},

	render: function() {
		var classes = classnames( this.props.className, 'range', {
			'has-min-content': !! this.props.minContent,
			'has-max-content': !! this.props.maxContent
		} );

		return (
			<div className={ classes }>
				{ this.getMinContentElement() }
				<FormRange id={ this.state.id } className="range__input" { ...omit( this.props, 'minContent', 'maxContent', 'showValueLabel', 'className' ) } />
				{ this.getMaxContentElement() }
				{ this.getValueLabelElement() }
			</div>
		);
	}
} );
