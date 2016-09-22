/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
const Suggestions = require( './suggestions-mixin' );

export default React.createClass( {
	displayName: 'Mentions',

	mixins: [ Suggestions ],

	getInitialState: function() {
		return {
			suggestionsVisible: false
		};
	},

	componentDidMount: function() {
		const self = this,
			editor = this.props.editor;

		function onEditorKeyUp( event ) {
			self.handleSuggestionsKeyUp( event, editor.getBody(), editor.getContent( { format: 'text' } ) );
		}

		editor.on( 'blur', this.handleSuggestionBlur );
		editor.on( 'keydown', this.handleSuggestionsKeyDown );
		editor.on( 'keyup', onEditorKeyUp );

		editor.on( 'remove', () => {
			editor.off( 'blur', this.handleSuggestionBlur );
			editor.off( 'keydown', this.handleSuggestionsKeyDown );
			editor.off( 'keyup', onEditorKeyUp );
		} );
	},

	render: function() {
		return (
			<div>
				{this.renderSuggestions()}
			</div>
		);
	}
} );
