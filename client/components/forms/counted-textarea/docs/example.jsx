/**
 * External dependencies
 */
var React = require( 'react' ),
	PureRenderMixin = require( 'react-pure-render/mixin' );

/**
 * Internal dependencies
 */
var CountedTextarea = require( 'components/forms/counted-textarea' ),
	DocsExample = require( 'components/docs-example' );

module.exports = React.createClass( {
	displayName: 'CountedTextareas',

	mixins: [ PureRenderMixin ],

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
			<DocsExample
				title="Counted Textareas"
				url="/devdocs/design/counted-textareas"
				componentUsageStats={ this.props.componentUsageStats }
			>
				<div>
					<CountedTextarea value={ this.state.value } onChange={ this.onChange } acceptableLength={ 20 } />
				</div>
			</DocsExample>
		);
	}
} );
