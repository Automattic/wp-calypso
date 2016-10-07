/**
 * External dependencies
 */
import React from 'react';
import ReactDomServer from 'react-dom/server';
import { connect } from 'react-redux';
import tinymce from 'tinymce/tinymce';
import includes from 'lodash/includes';

/**
 * Internal dependencies
 */
import SuggestionList from './suggestion-list';
import EditorMention from './editor-mention';
import QueryUsersSuggestions from 'components/data/query-users-suggestions';
import { getUserSuggestions } from 'state/users/suggestions/selectors';

/**
 * Module variables
 */
const VK = tinymce.util.VK;

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
			popoverContext: null,
			showPopover: false
		};
	},

	componentDidMount: function() {
		const { editor } = this.props;

		editor.on( 'keyup', this.onKeyUp );
	},

	setPopoverContext( popoverContext ) {
		if ( popoverContext ) {
			this.setState( { popoverContext } );
		}
	},

	getQueryText: function() {
		const range = this.props.editor.selection.getRng();
		const textBeforeCaret = range.startContainer.textContent.slice( 0, range.startOffset );
		const matcher = new RegExp( '(?:^|\\s)@([A-Za-z0-9_\+\-]*)$|(?:^|\\s)@([^\\x00-\\xff]*)$', 'gi' );
		const match = matcher.exec( textBeforeCaret );

		if ( match ) {
			return match[ 2 ] || match[ 1 ];
		}

		return null;
	},

	onKeyUp( { keyCode } ) {
		if ( includes( [ VK.ENTER, VK.SPACEBAR, VK.UP, VK.DOWN, 27 /* ESCAPE */ ], keyCode ) ) {
			return this.setState( { showPopover: false } );
		}

		const query = this.getQueryText();

		this.setState( {
			showPopover: typeof query === 'string',
			query,
		} );
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
		const { siteId, suggestions } = this.props;
		const { query, showPopover, popoverContext } = this.state;

		return (
			<div ref={ this.setPopoverContext }>
				<QueryUsersSuggestions siteId={ siteId } />
				<SuggestionList
					query={ query }
					suggestions={ suggestions }
					isVisible={ showPopover }
					popoverContext={ popoverContext }
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
