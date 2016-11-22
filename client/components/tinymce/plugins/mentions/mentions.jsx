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

const getMatchingSuggestions = function( suggestions, query ) {
	if ( ! query ) {
		return suggestions.slice( 0, 10 );
	}

	let matchingSuggestions = suggestions;

	matchingSuggestions = suggestions.filter( ( suggestion ) => {
		// Start of string or preceded by a space.
		const matcher = new RegExp( '^' + query + '| ' + query, 'ig' );
		const name = suggestion.name || suggestion.user_login + ' ' + suggestion.display_name;

		return matcher.test( name );
	} );

	return matchingSuggestions.slice( 0, 10 );
};

export class Mentions extends React.Component {
	constructor( props ) {
		super( props );

		this.state = {
			query: '',
			popoverContext: null,
			showPopover: false,
		};
	}

	componentDidMount() {
		const { editor } = this.props;
		const position = this.getPosition();

		editor.on( 'keydown', this.onKeyDown );
		editor.on( 'keyup', this.onKeyUp );
		editor.on( 'click', this.hidePopover );

		this.left = position.left;
		this.top = position.top;
	}

	componentWillUpdate( nextProps, nextState ) {
		// Update position of popover if going from invisible to visible state.
		if ( ! this.state.showPopover && nextState.showPopover ) {
			this.updatePosition();
			return;
		}

		// Update position of popover if cursor has moved to a new line.
		if ( nextState.showPopover ) {
			const currentPosition = this.getPosition();
			const isLineBefore = ( this.top > currentPosition.top ) && ( this.left < currentPosition.left );
			const isLineAfter = ( this.top < currentPosition.top ) && ( this.left > currentPosition.left );

			if ( isLineBefore || isLineAfter ) {
				this.updatePosition( currentPosition );
			}
		}
	}

	componentWillUnmount() {
		const { editor } = this.props;

		editor.off( 'keydown', this.onKeyDown );
		editor.off( 'keyup', this.onKeyUp );
		editor.off( 'click', this.hidePopover );
	}

	getPosition() {
		let left, top;
		const { editor } = this.props;
		const nodePosition = tinymce.$( editor.selection.getNode() ).offset();
		const rectList = editor.selection.getRng().getClientRects();

		if ( rectList.length > 0 ) {
			left = rectList[ 0 ].left;
			top = rectList[ 0 ].top + rectList[ 0 ].height;
		} else {
			left = nodePosition.left;
			top = nodePosition.top;
		}

		return { left: left, top: top };
	}

	updatePosition( position = this.getPosition() ) {
		const { editor, node } = this.props;
		const selectedNode = editor.selection.getNode();
		const nodePosition = tinymce.$( selectedNode ).offset();
		const mceToolbar = tinymce.$( '.mce-toolbar-grp', editor.getContainer() )[ 0 ];

		this.left = position.left;
		this.top = position.top;
		node.style.left = this.left + 'px';
		node.style.top = nodePosition.top + mceToolbar.offsetHeight + selectedNode.offsetHeight + 'px';
	}

	setPopoverContext = ( popoverContext ) => {
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

	getSelectedSuggestionIndex() {
		if ( ! this.matchingSuggestions ) {
			return null;
		}

		if ( ! this.state.selectedSuggestionId ) {
			return 0;
		}

		for ( let i = 0; i < this.matchingSuggestions.length; i++ ) {
			if ( this.matchingSuggestions[ i ].ID === this.state.selectedSuggestionId ) {
				return i;
			}
		}

		return null;
	}

	getSuggestion = function() {
		if ( ! this.matchingSuggestions ) {
			return null;
		}

		if ( ! this.state.selectedSuggestionId && this.matchingSuggestions.length > 0 ) {
			return this.matchingSuggestions[ 0 ];
		}

		for ( let i = 0; i < this.matchingSuggestions.length; i++ ) {
			if ( this.matchingSuggestions[ i ].ID === this.state.selectedSuggestionId ) {
				return this.matchingSuggestions[ i ];
			}
		}

		return null;
	}

	insertSuggestion = ( suggestion ) => {
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

	onKeyDown = ( e ) => {
		const { keyCode } = e;

		if ( includes( [ VK.DOWN, VK.UP ], keyCode ) ) {
			const selectedIndex = this.getSelectedSuggestionIndex();
			let nextIndex;

			if ( selectedIndex !== null ) {
				if ( keyCode === VK.DOWN ) {
					nextIndex = selectedIndex + 1;

					if ( nextIndex === this.matchingSuggestions.length ) {
						nextIndex = 0;
					}
				} else {
					nextIndex = selectedIndex - 1;

					if ( nextIndex < 0 ) {
						nextIndex = this.matchingSuggestions.length - 1;
					}
				}

				// Cancel the cursor move.
				e.preventDefault();

				this.setState( { selectedSuggestionId: this.matchingSuggestions[ nextIndex ].ID } );
			}
		}
	}

	onKeyUp = ( { keyCode } ) => {
		if ( includes( [ VK.DOWN, VK.UP ], keyCode ) ) {
			return;
		}

		if ( includes( [ VK.SPACEBAR, 27 /* ESCAPE */ ], keyCode ) ) {
			return this.hidePopover();
		}

		if ( keyCode === VK.ENTER ) {
			if ( ! this.state.showPopover || this.matchingSuggestions.length === 0 ) {
				return;
			}

			const suggestion = this.getSuggestion();

			if ( suggestion ) {
				this.insertSuggestion( suggestion );
			}

			return this.hidePopover();
		}

		const query = this.getQueryText();

		this.setState( {
			showPopover: query !== null,
			selectedSuggestionId: null,
			query,
		} );
	}

	hidePopover = () => {
		this.setState( { showPopover: false } );
	}

	handleClose = () => {
		this.hidePopover();
	}

	render() {
		const { siteId, suggestions } = this.props;
		const { query, showPopover, popoverContext } = this.state;
		let selectedSuggestionId;

		if ( suggestions && ( suggestions.length > 1 ) ) {
			this.matchingSuggestions = getMatchingSuggestions( suggestions, query );

			if ( this.state.selectedSuggestionId ) {
				selectedSuggestionId = this.state.selectedSuggestionId;
			} else if ( this.matchingSuggestions && this.matchingSuggestions.length > 0 ) {
				selectedSuggestionId = this.matchingSuggestions[ 0 ].ID;
			}
		}

		return (
			<div ref={ this.setPopoverContext }>
				<QueryUsersSuggestions siteId={ siteId } />
				{ this.matchingSuggestions && ( this.matchingSuggestions.length > 0 ) && showPopover &&
					<SuggestionList
						query={ query }
						suggestions={ this.matchingSuggestions }
						selectedSuggestionId={ selectedSuggestionId }
						popoverContext={ popoverContext }
						onClick={ this.insertSuggestion }
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
