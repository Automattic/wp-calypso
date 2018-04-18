/** @format */
/**
 * External dependencies
 */
import React from 'react';
import getCaretCoordinates from 'textarea-caret';
import { escapeRegExp, findIndex, get, head, includes, throttle } from 'lodash';

/**
 * Internal dependencies
 */
import UserMentionSuggestionList from './suggestion-list';

const keys = { enter: 13, esc: 27, spaceBar: 32, upArrow: 38, downArrow: 40 };

/**
 * withUserMentionSuggestions is a higher-order component that adds user mention support to whatever input it wraps.
 *
 * @example: withUserMentionSuggestions( Component )
 *
 * @param {object} EnhancedComponent - react component to wrap
 * @returns {object} the enhanced component
 */
export default EnhancedComponent =>
	class withUserMentions extends React.Component {
		matchingSuggestions = [];

		static displayName = `withUserMentions( ${ EnhancedComponent.displayName ||
			EnhancedComponent.name } )`;
		static propTypes = {};

		state = {
			showPopover: false,
			popoverContext: null,
			query: '',
		};

		constructor( props ) {
			super( props );
			// create a ref to store the textarea DOM element
			this.textInput = React.createRef();
			this.popoverStyles = {};
		}

		componentDidMount() {
			const { left, top, height } = this.getPosition();

			this.left = left;
			this.top = top;
			this.height = height;

			if ( typeof window !== 'undefined' ) {
				window.addEventListener( 'resize', this.throttledUpdatePosition );
			}
		}

		componentWillUpdate( nextProps, nextState ) {
			// Update position of popover if going from invisible to visible state.
			if ( ! this.state.showPopover && nextState.showPopover ) {
				this.updatePosition( nextState );
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
			if ( typeof window !== 'undefined' ) {
				window.removeEventListener( 'resize', this.throttledUpdatePosition );
			}
		}

		handleKeyDown = event => {
			const selectedIndex = this.getSelectedSuggestionIndex();

			if ( ! includes( [ keys.upArrow, keys.downArrow ], event.keyCode ) || -1 === selectedIndex ) {
				return;
			}

			let nextIndex;

			// Cancel the cursor move.
			event.preventDefault();

			if ( event.keyCode === keys.downArrow ) {
				nextIndex = ( selectedIndex + 1 ) % this.matchingSuggestions.length;
			} else {
				nextIndex = selectedIndex - 1;

				if ( nextIndex < 0 ) {
					nextIndex = this.matchingSuggestions.length - 1;
				}
			}

			this.setState( { selectedSuggestionId: this.matchingSuggestions[ nextIndex ].ID } );
		};

		handleKeyUp = event => {
			if ( includes( [ keys.downArrow, keys.upArrow ], event.keyCode ) ) {
				return;
			}

			if ( includes( [ keys.spaceBar, keys.esc ], event.keyCode ) ) {
				return this.hidePopover();
			}

			if ( includes( [ keys.enter ], event.keyCode ) ) {
				if ( ! this.state.showPopover || this.matchingSuggestions.length === 0 ) {
					return;
				}

				event.preventDefault();

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

		getQueryText() {
			const node = this.textInput.current;
			// (?:^|\\s) means start of input or whitespace
			// ([A-Za-z0-9_\+\-]*) means 0 or more instances of: A-Z a-z 0-9 _ + -
			const matcher = new RegExp( '(?:^|\\s)@([A-Za-z0-9_+-]*)$', 'gi' );
			const textBeforeCaret = node.value.slice( 0, node.selectionEnd );
			const match = matcher.exec( textBeforeCaret );

			return match && match.length > 1 ? match[ 1 ] : null;
		}

		getPosition() {
			const node = this.textInput.current;
			const nodeRect = node.getBoundingClientRect();
			const caretPosition = getCaretCoordinates( node, node.selectionEnd );
			const position = {
				left: nodeRect.left + caretPosition.left + 8,
				top: nodeRect.top + caretPosition.top + 10,
			};

			console.log( position ); // eslint-disable-line no-console

			return position;
		}

		getSuggestion() {
			const index = this.getSelectedSuggestionIndex();

			return index > -1 ? this.matchingSuggestions[ index ] : null;
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

		insertSuggestion = ( { user_login: userLogin } ) => {
			if ( ! userLogin ) {
				return;
			}

			const node = this.textInput.current;
			const textBeforeCaret = node.value.slice( 0, node.selectionEnd );
			const lastAtSymbolPosition = textBeforeCaret.lastIndexOf( '@' );
			const textBeforeAtSymbol = node.value.slice( 0, lastAtSymbolPosition );
			const textAfterSelectionEnd = node.value.slice( node.selectionEnd, node.value.length + 1 );

			node.value = textBeforeAtSymbol + '@' + userLogin + textAfterSelectionEnd;
		};

		updatePosition = ( state = this.state, newPosition ) => {
			if ( ! newPosition ) {
				newPosition = this.getPosition( state );
			}

			//console.log( 'updatePosition' );
			//console.log( this.state );

			const { left, top, height } = newPosition;

			this.left = left;
			this.top = top;
			this.height = height;

			this.popoverPositionLeft = `${ this.left }px`;
			// 10 is the top position of .popover__inner, which hasn't rendered yet.
			this.popoverPositionTop = `${ this.top }px`;
		};

		throttledUpdatePosition = throttle( this.updatePosition, 100 );

		hidePopover = () => this.setState( { showPopover: false } );

		render() {
			//const { siteId } = this.props;
			const { query, showPopover } = this.state;
			const suggestions = [
				{
					ID: 1,
					user_login: 'bungle',
				},
				{
					ID: 2,
					user_login: 'george',
				},
				{
					ID: 3,
					user_login: 'zippy',
				},
				{
					ID: 4,
					user_login: 'geoffrey',
				},
			];

			this.matchingSuggestions = this.getMatchingSuggestions( suggestions, query );
			const selectedSuggestionId =
				this.state.selectedSuggestionId || get( head( this.matchingSuggestions ), 'ID' );

			return (
				<div>
					<EnhancedComponent
						{ ...this.props }
						onKeyUp={ this.handleKeyUp }
						onKeyDown={ this.handleKeyDown }
						ref={ this.textInput }
					/>

					{ showPopover &&
						this.matchingSuggestions.length > 0 && (
							<UserMentionSuggestionList
								suggestions={ this.matchingSuggestions }
								selectedSuggestionId={ selectedSuggestionId }
								popoverContext={ this.textInput.current }
								popoverPositionLeft={ this.popoverPositionLeft }
								popoverPositionTop={ this.popoverPositionTop }
								onClick={ this.insertSuggestion }
								onClose={ this.hidePopover }
							/>
						) }
				</div>
			);
		}
	};
