/**
 * External dependencies
 */
import React from 'react';
import PureRenderMixin from 'react-pure-render/mixin';

/**
 * Internal dependencies
 */
import CountedTextarea from 'components/forms/counted-textarea';

export default React.createClass( {
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
			<CountedTextarea
				value={ this.state.value }
				onChange={ this.onChange }
				acceptableLength={ 20 } />
		);
	}
} );
