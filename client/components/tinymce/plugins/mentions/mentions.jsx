/**
 * External dependencies
 */
import React from 'react';
import ReactDomServer from 'react-dom/server';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import SuggestionList from './suggestion-list';
import EditorMention from './editor-mention';
import QueryUsersSuggestions from 'components/data/query-users-suggestions';
import { getUserSuggestions } from 'state/users/suggestions/selectors';

const Mentions = React.createClass( {
	displayName: 'Mentions',

	propTypes: {
		siteId: React.PropTypes.number,
		editor: React.PropTypes.object,
		suggestions: React.PropTypes.array
	},

	getDefaultProps() {
		return {
			suggestions: []
		};
	},

	getInitialState() {
		return {
			query: '',
			showPopover: false
		};
	},

	componentDidMount: function() {
		const { editor } = this.props;

		editor.on( 'keyup', this.onKeyUp );
	},

	getCurrentText: function() {
		const rng = this.props.editor.selection.getRng( 1 );

		return rng.startContainer.textContent;
	},

	getQueryText: function() {
		const value = this.getCurrentText();

		if ( ! value ) {
			return null;
		}

		const matcher = new RegExp( '(?:^|\\s)@([A-Za-z0-9_\+\-]*)$|(?:^|\\s)@([^\\x00-\\xff]*)$', 'gi' ),
			match = matcher.exec( value );

		if ( match ) {
			return match[ 2 ] || match[ 1 ];
		}

		return null;
	},

	onKeyUp( event ) {
		let newState = null;

		switch ( event.keyCode ) {
			case 13: //enter
			case 27: //esc
			case 32: //space
				newState = {
					showPopover: false
				};

				break;
			case 38:  //up arrow
			case 40:  //down arrow
				break;
			default:
				const query = this.getQueryText();

				newState = {
					query: query,
					showPopover: typeof query === 'string'
				};

				break;
		}

		if ( newState ) {
			this.setState( newState );
		}
	},

	handleClick: function( suggestion ) {
		const { editor } = this.props;
		const re = new RegExp( '@\\S+___PLACEHOLDER___' );
		const markup = <EditorMention username={ suggestion.user_login } />;

		editor.insertContent( '___PLACEHOLDER___<span id="cursor">&nbsp;</span>' );

		const newContent = editor.getContent().replace( re, ReactDomServer.renderToStaticMarkup( markup ) );

		editor.setContent( newContent );
		editor.getBody().focus();
		editor.selection.select( editor.dom.select( '#cursor' )[ 0 ] );
		editor.selection.collapse( true );
		editor.dom.remove( editor.dom.select( '#cursor' )[ 0 ] );
	},

	handleClose: function() {
		this.setState( {
			showPopover: false
		} );
	},

	render() {
		return (
			<div>
				<QueryUsersSuggestions siteId={ this.props.siteId } />
				<SuggestionList
					query={ this.state.query }
					suggestions={ this.props.suggestions }
					isVisible={ this.state.showPopover }
					onClick={ this.handleClick }
					onClose={ this.handleClose }>
				</SuggestionList>
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
