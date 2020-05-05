/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import ReactDomServer from 'react-dom/server';
import { connect } from 'react-redux';
import { escapeRegExp, findIndex, get, head, includes, last, pick } from 'lodash';
import tinymce from 'tinymce/tinymce';

/**
 * Internal dependencies
 */
import SuggestionList from 'blocks/user-mentions/suggestion-list';
import EditorMention from './editor-mention';
import QueryUsersSuggestions from 'components/data/query-users-suggestions';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getUserSuggestions } from 'state/users/suggestions/selectors';

/**
 * Module variables
 */
// TinyMCE mapping of common keycodes.
const VK = tinymce.util.VK;

export class Mentions extends Component {
	matchingSuggestions = [];

	state = {
		query: '',
		showPopover: false,
	};

	popoverContext = React.createRef();

	componentDidMount() {
		const { editor } = this.props;
		const { left, top } = this.getPosition();

		editor.on( 'keyup', this.onKeyUp );
		editor.on( 'click', this.hidePopover );

		this.left = left;
		this.top = top;
	}

	UNSAFE_componentWillUpdate( nextProps, nextState ) {
		// Update position of popover if going from invisible to visible state.
		if ( ! this.state.showPopover && nextState.showPopover ) {
			this.updatePosition( nextState );
			this.props.editor.on( 'keydown', this.onKeyDown );

			return;
		}

		// Visible to invisible state.
		if ( this.state.showPopover && ! nextState.showPopover ) {
			this.props.editor.off( 'keydown', this.onKeyDown );

			return;
		}

		// Update position of popover if cursor has moved to a new line.
		if ( nextState.showPopover ) {
			const { top, left } = this.getPosition();
			const isLineBefore = this.top > top && this.left < left;
			const isLineAfter = this.top < top && this.left > left;

			if ( isLineBefore || isLineAfter ) {
				this.updatePosition( nextState, { top, left } );
			}
		}
	}

	componentWillUnmount() {
		const { editor } = this.props;

		editor.off( 'keydown', this.onKeyDown );
		editor.off( 'keyup', this.onKeyUp );
		editor.off( 'click', this.hidePopover );
	}

	getMatchingSuggestions( suggestions, query ) {
		if ( query ) {
			query = escapeRegExp( query );
			const matcher = new RegExp( `^${ query }|\\s${ query }`, 'ig' ); // Start of string or preceded by a space.

			suggestions = suggestions.filter( ( { user_login: login, display_name: name } ) =>
				matcher.test( `${ login } ${ name }` )
			);
		}

		return suggestions.slice( 0, 10 );
	}

	getPosition( { query } = this.state ) {
		const { editor } = this.props;
		const range = editor.selection.getRng();
		const mentionRange = document.createRange();

		// Set range to start at beginning of mention in order to get accurate positioning values.
		mentionRange.setStart( range.startContainer, range.startOffset - query.length );
		mentionRange.setEnd( range.endContainer, range.endOffset );

		const rectList = mentionRange.getClientRects();
		const position =
			rectList.length > 0 ? last( rectList ) : tinymce.$( editor.selection.getNode() ).offset();

		return pick( position, [ 'left', 'top' ] );
	}

	updatePosition( state, { left, top } = this.getPosition( state ) ) {
		const { editor, node } = this.props;
		const mceToolbarOffsetHeight = get(
			tinymce.$( '.mce-toolbar-grp', editor.getContainer() )[ 0 ],
			'offsetHeight',
			0
		);
		const range = editor.selection.getRng();
		const rectList = range.getClientRects();
		let height;

		if ( rectList.length > 0 ) {
			height = rectList[ 0 ].height;
		} else {
			height = editor.selection.getNode().offsetHeight;
		}

		this.left = left;
		this.top = top;

		node.style.left = `${ this.left }px`;
		// 10 is the top position of .user-mentions__suggestions .popover__inner, which hasn't rendered yet.
		node.style.top = `${ mceToolbarOffsetHeight + this.top + height - 10 }px`;
	}

	getQueryText() {
		// (?:^|\\s) means start of input or whitespace
		// ([A-Za-z0-9_\+\-]*) means 0 or more instances of: A-Z a-z 0-9 _ + -
		const matcher = new RegExp( '(?:^|\\s)@([A-Za-z0-9_+-]*)$', 'gi' );
		const range = this.props.editor.selection.getRng();
		const textBeforeCaret = range.startContainer.textContent.slice( 0, range.startOffset );
		const match = matcher.exec( textBeforeCaret );

		return match && match.length > 1 ? match[ 1 ] : null;
	}

	getSelectedSuggestionIndex() {
		if ( ! this.state.selectedSuggestionId ) {
			return 0;
		}

		return findIndex(
			this.matchingSuggestions,
			( { ID: id } ) => id === this.state.selectedSuggestionId
		);
	}

	getSuggestion() {
		const index = this.getSelectedSuggestionIndex();

		return index > -1 ? this.matchingSuggestions[ index ] : null;
	}

	insertSuggestion = ( { user_login: userLogin } ) => {
		if ( ! userLogin ) {
			return;
		}

		const { selection } = this.props.editor;
		const markup = <EditorMention username={ userLogin } />;
		const range = selection.getRng();
		const mentionRange = document.createRange();

		// Set a range for the user-entered mention.
		mentionRange.setStart(
			range.startContainer,
			Math.max( range.startOffset - ( this.state.query.length + 1 ), 0 )
		);
		mentionRange.setEnd( range.endContainer, range.endOffset );
		selection.setRng( mentionRange );

		// Replace user-entered mention with full username.
		selection.setContent(
			selection.getContent().replace( /@\S*/, ReactDomServer.renderToStaticMarkup( markup ) )
		);

		this.props.editor.getBody().focus();
	};

	onKeyDown = ( { keyCode, preventDefault } ) => {
		const selectedIndex = this.getSelectedSuggestionIndex();

		if ( ! includes( [ VK.DOWN, VK.UP ], keyCode ) || -1 === selectedIndex ) {
			return;
		}

		let nextIndex;

		// Cancel the cursor move.
		preventDefault();

		if ( keyCode === VK.DOWN ) {
			nextIndex = ( selectedIndex + 1 ) % this.matchingSuggestions.length;
		} else {
			nextIndex = selectedIndex - 1;

			if ( nextIndex < 0 ) {
				nextIndex = this.matchingSuggestions.length - 1;
			}
		}

		this.setState( { selectedSuggestionId: this.matchingSuggestions[ nextIndex ].ID } );
	};

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
	};

	hidePopover = () => this.setState( { showPopover: false } );

	render() {
		const { siteId, suggestions } = this.props;
		const { query, showPopover } = this.state;

		this.matchingSuggestions = this.getMatchingSuggestions( suggestions, query );
		const selectedSuggestionId =
			this.state.selectedSuggestionId || get( head( this.matchingSuggestions ), 'ID' );

		return (
			<div ref={ this.popoverContext }>
				<QueryUsersSuggestions siteId={ siteId } />
				{ this.matchingSuggestions.length > 0 && showPopover && (
					<SuggestionList
						query={ query }
						suggestions={ this.matchingSuggestions }
						selectedSuggestionId={ selectedSuggestionId }
						popoverContext={ this.popoverContext.current }
						onClick={ this.insertSuggestion }
						onClose={ this.hidePopover }
					/>
				) }
			</div>
		);
	}
}

Mentions.propTypes = {
	editor: PropTypes.object.isRequired,
	node: PropTypes.object.isRequired,
	siteId: PropTypes.number.isRequired,
	suggestions: PropTypes.array,
};

Mentions.defaultProps = {
	suggestions: [],
};

export default connect( ( state ) => {
	const siteId = getSelectedSiteId( state );

	return {
		siteId,
		suggestions: getUserSuggestions( state, siteId ),
	};
} )( Mentions );
