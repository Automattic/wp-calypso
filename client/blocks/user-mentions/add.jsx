/**
 * External dependencies
 */
import React, { Fragment } from 'react';
import getCaretCoordinates from 'textarea-caret';
import { escapeRegExp, findIndex, get, head, includes, throttle, pick } from 'lodash';

/**
 * Internal dependencies
 */
import UserMentionSuggestionList from './suggestion-list';

const keys = { tab: 9, enter: 13, esc: 27, spaceBar: 32, upArrow: 38, downArrow: 40 };

/**
 * addUserMentions is a higher-order component that adds user mention support to whatever input it wraps.
 *
 * Suggestions can be provided via the suggestions prop, or by the connectUserMentions higher-order component.
 *
 * @example addUserMentions( Component )
 *
 * @param {object} WrappedComponent - React component to wrap
 * @returns {object} the enhanced component
 */
export default ( WrappedComponent ) =>
	class AddUserMentions extends React.Component {
		matchingSuggestions = [];

		static displayName = `withUserMentions( ${
			WrappedComponent.displayName || WrappedComponent.name
		} )`;
		static propTypes = {};

		state = {
			showPopover: false,
			popoverContext: null,
			popoverPosition: null,
			query: '',
		};

		constructor( props ) {
			super( props );
			// create a ref to store the textarea DOM element
			this.textInput = React.createRef();
		}

		componentDidMount() {
			if ( typeof window !== 'undefined' ) {
				window.addEventListener( 'resize', this.throttledUpdatePosition );
			}
		}

		UNSAFE_componentWillUpdate( nextProps, nextState ) {
			// Update position of popover if going from invisible to visible state.
			if ( ! this.state.showPopover && nextState.showPopover ) {
				this.updatePosition( nextState );
				return;
			}

			// Update position of popover if cursor has moved to a new line.
			if ( nextState.showPopover ) {
				const currentTop = this.state.popoverPosition && this.state.popoverPosition.top;
				const currentLeft = this.state.popoverPosition && this.state.popoverPosition.left;

				if ( currentTop && currentLeft ) {
					const { top, left } = this.getPosition();
					const isLineBefore = currentTop > top && currentTop < left;
					const isLineAfter = currentTop < top && currentLeft > left;

					if ( isLineBefore || isLineAfter ) {
						this.updatePosition( nextState, { top, left } );
					}
				}
			}
		}

		componentWillUnmount() {
			if ( typeof window !== 'undefined' ) {
				window.removeEventListener( 'resize', this.throttledUpdatePosition );
			}
		}

		handleKeyDown = ( event ) => {
			if ( ! this.state.showPopover ) {
				return;
			}

			const selectedIndex = this.getSelectedSuggestionIndex();

			// Cancel Enter and Tab default actions so we can define our own in keyUp
			if ( includes( [ keys.enter, keys.tab ], event.keyCode ) ) {
				event.preventDefault();
				return false;
			}

			if ( ! includes( [ keys.upArrow, keys.downArrow ], event.keyCode ) || -1 === selectedIndex ) {
				return;
			}

			let nextIndex;

			// Cancel the cursor move.
			event.preventDefault();

			// Change the selected suggestion
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

		handleKeyUp = ( event ) => {
			if ( includes( [ keys.downArrow, keys.upArrow ], event.keyCode ) ) {
				return;
			}

			if ( includes( [ keys.spaceBar, keys.esc ], event.keyCode ) ) {
				return this.hidePopover();
			}

			if ( includes( [ keys.enter, keys.tab ], event.keyCode ) ) {
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
			const textBeforeCaret = node.value.slice( 0, node.selectionEnd );
			const lastAtSymbolPosition = textBeforeCaret.lastIndexOf( '@' );
			const textFromLastAtSymbol = node.value.slice( lastAtSymbolPosition, node.value.length + 1 );

			// (?:^|\\s) means start of input or whitespace
			// ([A-Za-z0-9_\+\-]*) means 0 or more instances of: A-Z a-z 0-9 _ + -
			const matcher = new RegExp( '(?:^|\\s)@([A-Za-z0-9_+-]*)$', 'gi' );
			const match = matcher.exec( textFromLastAtSymbol );

			return match && match.length > 1 ? match[ 1 ] : null;
		}

		getPosition() {
			const node = this.textInput.current;
			const nodeRect = node.getBoundingClientRect();
			const query = this.getQueryText();

			// We want the position of the caret at the @ symbol
			let caretPosition = node.selectionEnd;
			if ( query ) {
				caretPosition = node.selectionEnd - query.length;
			}

			// Get the line height in the textarea
			let lineHeight;
			const lineHeightAdjustment = 4;
			const style = window.getComputedStyle( node );
			const lineHeightValueWithPixels = style.getPropertyValue( 'line-height' );
			if ( lineHeightValueWithPixels ) {
				lineHeight = +lineHeightValueWithPixels.replace( 'px', '' ) + lineHeightAdjustment;
			}

			// Figure out where the popover should go, taking account of @ symbol position, scroll position and line height
			const caretCoordinates = getCaretCoordinates( node, caretPosition );
			const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
			const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
			const position = {
				left: nodeRect.left + caretCoordinates.left + scrollLeft,
				top: nodeRect.top + caretCoordinates.top + scrollTop + lineHeight,
			};

			// If we're close to the window edge, shuffle the popover left so it doesn't vanish
			const windowEdgeThreshold = 150;
			const windowWidthDifference = window.innerWidth - position.left;

			if ( windowWidthDifference < windowEdgeThreshold ) {
				position.left = position.left - ( windowEdgeThreshold - windowWidthDifference );
			}

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

		// Insert a selected suggestion into the textbox
		insertSuggestion = ( { user_login: userLogin } ) => {
			if ( ! userLogin ) {
				return;
			}

			const node = this.textInput.current;
			const textBeforeCaret = node.value.slice( 0, node.selectionEnd );
			const lastAtSymbolPosition = textBeforeCaret.lastIndexOf( '@' );
			const textBeforeAtSymbol = node.value.slice( 0, lastAtSymbolPosition );
			const textAfterSelectionEnd = node.value.slice( node.selectionEnd, node.value.length + 1 );

			let newTextValue = textBeforeAtSymbol + '@' + userLogin;

			// Add the text after the caret, but only if it doesn't match the username (avoids duplication)
			if ( userLogin !== textAfterSelectionEnd ) {
				newTextValue += textAfterSelectionEnd;
			}

			node.value = newTextValue;

			// Make sure the input still has focus (after a selection has been chosen with the mouse, for example)
			node.focus();

			// Move the caret to the end of the inserted username
			node.selectionStart = lastAtSymbolPosition + newTextValue.length;
		};

		updatePosition = ( state = this.state, newPosition ) => {
			if ( ! newPosition ) {
				newPosition = this.getPosition( state );
			}

			this.setState( { popoverPosition: newPosition } );
		};

		throttledUpdatePosition = throttle( this.updatePosition, 100 );

		hidePopover = () => this.setState( { showPopover: false } );

		render() {
			const { suggestions } = this.props;
			const { query, showPopover } = this.state;

			this.matchingSuggestions = this.getMatchingSuggestions( suggestions, query );
			const selectedSuggestionId =
				this.state.selectedSuggestionId || get( head( this.matchingSuggestions ), 'ID' );

			const popoverPosition = pick( this.state.popoverPosition, [ 'top', 'left' ] );

			return (
				<Fragment>
					<WrappedComponent
						{ ...this.props }
						onKeyUp={ this.handleKeyUp }
						onKeyDown={ this.handleKeyDown }
						ref={ this.textInput }
					/>

					{ showPopover && this.matchingSuggestions.length > 0 && (
						<UserMentionSuggestionList
							suggestions={ this.matchingSuggestions }
							selectedSuggestionId={ selectedSuggestionId }
							popoverContext={ this.textInput.current }
							popoverPosition={ popoverPosition }
							onClick={ this.insertSuggestion }
							onClose={ this.hidePopover }
						/>
					) }
				</Fragment>
			);
		}
	};
