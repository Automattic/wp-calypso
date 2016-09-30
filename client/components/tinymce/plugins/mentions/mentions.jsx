/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
const Suggestions = require( './suggestions-mixin' );
import QueryUsersSuggestions from 'components/data/query-users-suggestions';
import { getUserSuggestions } from 'state/users/suggestions/selectors';

const Mentions = React.createClass( {
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

		editor.on( 'keydown', this.handleSuggestionsKeyDown );
		editor.on( 'keyup', onEditorKeyUp );

		editor.on( 'remove', () => {
			editor.off( 'keydown', this.handleSuggestionsKeyDown );
			editor.off( 'keyup', onEditorKeyUp );
		} );
	},

	render: function() {
		return (
			<div ref="mention">
				<QueryUsersSuggestions siteId={ this.props.siteId } />
				{ this.renderSuggestions() }
			</div>
		);
	}
} );

export default connect( ( state, ownProps ) => {
	const { siteId } = ownProps;

	return {
		suggestions: getUserSuggestions( state, siteId )
	};
} )( Mentions );
