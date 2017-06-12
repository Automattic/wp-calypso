/**
 * External dependencies
 */
var React = require( 'react' ),
	PureRenderMixin = require( 'react-pure-render/mixin' );

/**
 * Internal dependencies
 */
var FormRange = require( 'components/forms/range' );
var Gridicon = require( 'gridicons' );

module.exports = React.createClass( {
	displayName: 'Ranges',

	mixins: [ PureRenderMixin ],

	getInitialState: function() {
		return {
			rangeValue: 24
		};
	},

	onChange: function( event ) {
		this.setState( {
			rangeValue: event.target.value
		} );
	},

	render: function() {
		return (
			<FormRange
				minContent={ <Gridicon icon="minus-small" /> }
				maxContent={ <Gridicon icon="plus-small" /> }
				max="100"
				value={ this.state.rangeValue }
				onChange={ this.onChange }
				showValueLabel={ true } />
		);
	}
} );
