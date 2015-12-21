/**
 * External dependencies
 */
var React = require( 'react' ),
	PureRenderMixin = require( 'react-pure-render/mixin' );

/**
 * Internal dependencies
 */
var FormRange = require( 'components/forms/range' );

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
			<div className="design-assets__group">
				<h2>
					<a href="/devdocs/design/ranges">Ranges</a>
				</h2>
				<FormRange
					minContent={ <span className="noticon noticon-minus" /> }
					maxContent={ <span className="noticon noticon-plus" /> }
					max="100"
					value={ this.state.rangeValue }
					onChange={ this.onChange }
					showValueLabel={ true } />
			</div>
		);
	}
} );
