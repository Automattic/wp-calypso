/**
 * External dependencies
 */
var React = require( 'react' ),
	PureRenderMixin = require( 'react-pure-render/mixin' );

/**
 * Internal dependencies
 */
import CountedTextarea from 'components/forms/counted-textarea';
import DocsExample from 'components/docs-example';

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
				componentUsageStats={ this.props.getUsageStats( CountedTextarea, { folder: 'forms' } ) }
			>
				<div>
					<CountedTextarea value={ this.state.value } onChange={ this.onChange } acceptableLength={ 20 } />
				</div>
			</DocsExample>
		);
	}
} );
