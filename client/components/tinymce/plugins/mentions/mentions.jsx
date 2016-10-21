/**
 * External dependencies
 */
import React from 'react';
import ReactDomServer from 'react-dom/server';
import { connect } from 'react-redux';
import { includes } from 'lodash';
import tinymce from 'tinymce/tinymce';

/**
 * Internal dependencies
 */
import SuggestionList from './suggestion-list';
import EditorMention from './editor-mention';
import QueryUsersSuggestions from 'components/data/query-users-suggestions';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getUserSuggestions } from 'state/users/suggestions/selectors';

/**
 * Module variables
 */
const VK = tinymce.util.VK;

export class Mentions extends React.Component {
	constructor( props ) {
		super( props );

		this.state = {
			query: '',
			popoverContext: null,
			showPopover: false,
		};

		this.setPopoverContext = this.setPopoverContext.bind( this );
		this.handleClick = this.handleClick.bind( this );
		this.handleClose = this.handleClose.bind( this );
	}

	componentDidMount() {
		const { editor } = this.props;

		editor.on( 'keyup', this.onKeyUp.bind( this ) );
		editor.on( 'click', () => {
			this.setState( { showPopover: false } );
		} );
	}

	setPopoverContext( popoverContext ) {
		if ( popoverContext ) {
			this.setState( { popoverContext } );
		}
	}

	getQueryText() {
		const range = this.props.editor.selection.getRng();
		const textBeforeCaret = range.startContainer.textContent.slice( 0, range.startOffset );
		const matcher = new RegExp( '(?:^|\\s)@([A-Za-z0-9_\+\-]*)$|(?:^|\\s)@([^\\x00-\\xff]*)$', 'gi' );
		const match = matcher.exec( textBeforeCaret );

		if ( match ) {
			return match[ 2 ] || match[ 1 ];
		}

		return null;
	}

	onKeyUp( { keyCode } ) {
		if ( includes( [ VK.ENTER, VK.SPACEBAR, VK.UP, VK.DOWN, 27 /* ESCAPE */ ], keyCode ) ) {
			return this.setState( { showPopover: false } );
		}

		const query = this.getQueryText();

		this.setState( {
			showPopover: typeof query === 'string',
			query,
		} );
	}

	handleClick( suggestion ) {
		const { editor } = this.props;
		const re = /@\S*/;
		const markup = <EditorMention username={ suggestion.user_login } />;
		const range = editor.selection.getRng();
		const mentionRange = document.createRange();

		// Set a range for the user-entered mention.
		mentionRange.setStart( range.startContainer, Math.max( range.startOffset - ( this.state.query.length + 1 ), 0 ) );
		mentionRange.setEnd( range.endContainer, range.endOffset );
		editor.selection.setRng( mentionRange );

		// Replace user-entered mention with full username.
		editor.selection.setContent( editor.selection.getContent().replace( re, ReactDomServer.renderToStaticMarkup( markup ) ) );

		editor.getBody().focus();
	}

	handleClose() {
		this.setState( {
			showPopover: false
		} );
	}

	render() {
		const { siteId, suggestions } = this.props;
		const { query, showPopover, popoverContext } = this.state;

		return (
			<div ref={ this.setPopoverContext }>
				<QueryUsersSuggestions siteId={ siteId } />
				{ suggestions.length > 1 && showPopover &&
					<SuggestionList
						query={ query }
						suggestions={ suggestions }
						popoverContext={ popoverContext }
						onClick={ this.handleClick }
						onClose={ this.handleClose } />
				}
			</div>
		);
	}
}

Mentions.propTypes = {
	editor: React.PropTypes.object.isRequired,
	siteId: React.PropTypes.number.isRequired,
	suggestions: React.PropTypes.array,
};

Mentions.defaultProps = {
	suggestions: [],
};

export default connect( ( state ) => {
	const siteId = getSelectedSiteId( state );

	return {
		suggestions: getUserSuggestions( state, siteId ),
		siteId
	};
} )( Mentions );
