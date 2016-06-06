/**
 * External dependencies
 */
import React from 'react';
import PureRenderMixin from 'react-pure-render/mixin';

/**
 * Internal dependencies
 */
import DocsExample from 'components/docs-example';
import FormRange from 'components/forms/range';

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
			<DocsExample
				title="Ranges"
				url="/devdocs/design/ranges"
				componentUsageStats={ this.props.getUsageStats( FormRange, { folder: 'forms' } ) }
			>
				<FormRange
					minContent={ <span className="noticon noticon-minus" /> }
					maxContent={ <span className="noticon noticon-plus" /> }
					max="100"
					value={ this.state.rangeValue }
					onChange={ this.onChange }
					showValueLabel={ true } />
			</DocsExample>
		);
	}
} );
