/**
 * External dependencies
 */
var React = require( 'react' );

/**
 * Internal dependencies
 */
var CountedTextarea = require( 'components/forms/counted-textarea' );

module.exports = React.createClass( {
	displayName: 'CountedTextareas',

	mixins: [ React.addons.PureRenderMixin ],

	getInitialState: function() {
		return {
			value: 'Hello World!'
		};
	},

	onChange: function( event ) {
		this.setState( {
			value: event.target.value
		} );
	},

	render: function() {
		return (
			<div className="design-assets__group">
				<h2>
					<a href="/devdocs/design/counted-textareas">Counted Textareas</a>
				</h2>

				<div>
					<CountedTextarea value={ this.state.value } onChange={ this.onChange } acceptableLength={ 20 } />
				</div>
			</div>
		);
	}
} );
