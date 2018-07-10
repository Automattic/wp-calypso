/**
 * External dependencies
 */
import classnames from 'classnames';
import { escapeRegExp, find, filter, map, debounce } from 'lodash';
import 'element-closest';

/**
 * WordPress dependencies
 */
import { Component, compose, renderToString } from '@wordpress/element';
import { ENTER, ESCAPE, UP, DOWN, LEFT, RIGHT, SPACE } from '@wordpress/keycodes';
import { __, _n, sprintf } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import './style.scss';
import withFocusOutside from '../higher-order/with-focus-outside';
import Button from '../button';
import Popover from '../popover';
import withInstanceId from '../higher-order/with-instance-id';
import withSpokenMessages from '../higher-order/with-spoken-messages';

/**
 * A raw completer option.
 * @typedef {*} CompleterOption
 */

/**
 * @callback FnGetOptions
 *
 * @returns {(CompleterOption[]|Promise.<CompleterOption[]>)} The completer options or a promise for them.
 */

/**
 * @callback FnGetOptionKeywords
 * @param {CompleterOption} option a completer option.
 *
 * @returns {string[]} list of key words to search.
 */

/**
 * @callback FnIsOptionDisabled
 * @param {CompleterOption} option a completer option.
 *
 * @returns {string[]} whether or not the given option is disabled.
 */

/**
 * @callback FnGetOptionLabel
 * @param {CompleterOption} option a completer option.
 *
 * @returns {(string|Array.<(string|Component)>)} list of react components to render.
 */

/**
 * @callback FnAllowNode
 * @param {Node} textNode check if the completer can handle this text node.
 *
 * @returns {boolean} true if the completer can handle this text node.
 */

/**
 * @callback FnAllowContext
 * @param {Range} before the range before the auto complete trigger and query.
 * @param {Range} after the range after the autocomplete trigger and query.
 *
 * @returns {boolean} true if the completer can handle these ranges.
 */

/**
 * @typedef {Object} OptionCompletion
 * @property {('insert-at-caret', 'replace')} action the intended placement of the completion.
 * @property {OptionCompletionValue} value the completion value.
 */

/**
 * A completion value.
 * @typedef {(String|WPElement|Object)} OptionCompletionValue
 */

/**
 * @callback FnGetOptionCompletion
 * @param {CompleterOption} value the value of the completer option.
 * @param {Range} range the nodes included in the autocomplete trigger and query.
 * @param {String} query the text value of the autocomplete query.
 *
 * @returns {(OptionCompletion|OptionCompletionValue)} the completion for the given option. If an
 * 													   OptionCompletionValue is returned, the
 * 													   completion action defaults to `insert-at-caret`.
 */

/**
 * @typedef {Object} Completer
 * @property {String} name a way to identify a completer, useful for selective overriding.
 * @property {?String} className A class to apply to the popup menu.
 * @property {String} triggerPrefix the prefix that will display the menu.
 * @property {(CompleterOption[]|FnGetOptions)} options the completer options or a function to get them.
 * @property {?FnGetOptionKeywords} getOptionKeywords get the keywords for a given option.
 * @property {?FnIsOptionDisabled} isOptionDisabled get whether or not the given option is disabled.
 * @property {FnGetOptionLabel} getOptionLabel get the label for a given option.
 * @property {?FnAllowNode} allowNode filter the allowed text nodes in the autocomplete.
 * @property {?FnAllowContext} allowContext filter the context under which the autocomplete activates.
 * @property {FnGetOptionCompletion} getOptionCompletion get the completion associated with a given option.
 */

/**
 * Recursively select the firstChild until hitting a leaf node.
 *
 * @param {Node} node The node to find the recursive first child.
 *
 * @return {Node} The first leaf-node >= node in the ordering.
 */
function descendFirst( node ) {
	let n = node;
	while ( n.firstChild ) {
		n = n.firstChild;
	}
	return n;
}

/**
 * Recursively select the lastChild until hitting a leaf node.
 *
 * @param {Node} node The node to find the recursive last child.
 *
 * @return {Node} The first leaf-node <= node in the ordering.
 */
function descendLast( node ) {
	let n = node;
	while ( n.lastChild ) {
		n = n.lastChild;
	}
	return n;
}

/**
 * Is the node a text node.
 *
 * @param {?Node} node The node to check.
 *
 * @return {boolean} True if the node is a text node.
 */
function isTextNode( node ) {
	return node !== null && node.nodeType === 3;
}

/**
 * Return the node only if it is a text node, otherwise return null.
 *
 * @param {?Node} node The node to filter.
 *
 * @return {?Node} The node or null if it is not a text node.
 */
function onlyTextNode( node ) {
	return isTextNode( node ) ? node : null;
}

/**
 * Find the index of the last character in the text that is whitespace.
 *
 * @param {string} text The text to search.
 *
 * @return {number} The last index of a white space character in the text or -1.
 */
function lastIndexOfSpace( text ) {
	for ( let i = text.length - 1; i >= 0; i-- ) {
		if ( /\s/.test( text.charAt( i ) ) ) {
			return i;
		}
	}
	return -1;
}

function filterOptions( search, options = [], maxResults = 10 ) {
	const filtered = [];
	for ( let i = 0; i < options.length; i++ ) {
		const option = options[ i ];

		// Merge label into keywords
		let { keywords = [] } = option;
		if ( 'string' === typeof option.label ) {
			keywords = [ ...keywords, option.label ];
		}

		const isMatch = keywords.some( ( keyword ) => search.test( keyword ) );
		if ( ! isMatch ) {
			continue;
		}

		filtered.push( option );

		// Abort early if max reached
		if ( filtered.length === maxResults ) {
			break;
		}
	}

	return filtered;
}

export class Autocomplete extends Component {
	static getInitialState() {
		return {
			search: /./,
			selectedIndex: 0,
			suppress: undefined,
			open: undefined,
			query: undefined,
			range: undefined,
			filteredOptions: [],
		};
	}

	constructor() {
		super( ...arguments );

		this.bindNode = this.bindNode.bind( this );
		this.select = this.select.bind( this );
		this.reset = this.reset.bind( this );
		this.resetWhenSuppressed = this.resetWhenSuppressed.bind( this );
		this.search = this.search.bind( this );
		this.handleKeyDown = this.handleKeyDown.bind( this );
		this.getWordRect = this.getWordRect.bind( this );
		this.debouncedLoadOptions = debounce( this.loadOptions, 250 );

		this.state = this.constructor.getInitialState();
	}

	bindNode( node ) {
		this.node = node;
	}

	insertCompletion( range, replacement ) {
		const container = document.createElement( 'div' );
		container.innerHTML = renderToString( replacement );
		while ( container.firstChild ) {
			const child = container.firstChild;
			container.removeChild( child );
			range.insertNode( child );
			range.setStartAfter( child );
		}
		range.deleteContents();

		let inputEvent;
		if ( undefined !== window.InputEvent ) {
			inputEvent = new window.InputEvent( 'input', { bubbles: true, cancelable: false } );
		} else {
			// IE11 doesn't provide an InputEvent constructor.
			inputEvent = document.createEvent( 'UIEvent' );
			inputEvent.initEvent( 'input', true /* bubbles */, false /* cancelable */ );
		}
		range.commonAncestorContainer.closest( '[contenteditable=true]' ).dispatchEvent( inputEvent );
	}

	select( option ) {
		const { onReplace } = this.props;
		const { open, range, query } = this.state;
		const { getOptionCompletion } = open || {};

		if ( option.isDisabled ) {
			return;
		}

		if ( getOptionCompletion ) {
			const completion = getOptionCompletion( option.value, range, query );

			const { action, value } =
				( undefined === completion.action || undefined === completion.value ) ?
					{ action: 'insert-at-caret', value: completion } :
					completion;

			if ( 'replace' === action ) {
				onReplace( [ value ] );
			} else if ( 'insert-at-caret' === action ) {
				this.insertCompletion( range, value );
			} else if ( 'backcompat' === action ) {
				// NOTE: This block should be removed once we no longer support the old completer interface.
				const onSelect = value;
				const deprecatedOptionObject = option.value;
				const selectionResult = onSelect( deprecatedOptionObject.value, range, query );
				if ( selectionResult !== undefined ) {
					this.insertCompletion( range, selectionResult );
				}
			}
		}

		// Reset autocomplete state after insertion rather than before
		// so insertion events don't cause the completion menu to redisplay.
		this.reset();
	}

	reset() {
		const isMounted = !! this.node;

		// Autocompletions may replace the block containing this component,
		// so we make sure it is mounted before resetting the state.
		if ( isMounted ) {
			this.setState( this.constructor.getInitialState() );
		}
	}

	resetWhenSuppressed() {
		const { open, suppress } = this.state;
		if ( open && suppress === open.idx ) {
			this.reset();
		}
	}

	handleFocusOutside() {
		this.reset();
	}

	// this method is separate so it can be overridden in tests
	getCursor( container ) {
		const selection = window.getSelection();
		if ( selection.isCollapsed ) {
			if ( 'production' !== process.env.NODE_ENV ) {
				if ( ! container.contains( selection.anchorNode ) ) {
					throw new Error( 'Invalid assumption: expected selection to be within the autocomplete container' );
				}
			}
			return {
				node: selection.anchorNode,
				offset: selection.anchorOffset,
			};
		}
		return null;
	}

	// this method is separate so it can be overridden in tests
	createRange( startNode, startOffset, endNode, endOffset ) {
		const range = document.createRange();
		range.setStart( startNode, startOffset );
		range.setEnd( endNode, endOffset );
		return range;
	}

	announce( filteredOptions ) {
		const { debouncedSpeak } = this.props;
		if ( ! debouncedSpeak ) {
			return;
		}
		if ( !! filteredOptions.length ) {
			debouncedSpeak( sprintf( _n(
				'%d result found, use up and down arrow keys to navigate.',
				'%d results found, use up and down arrow keys to navigate.',
				filteredOptions.length
			), filteredOptions.length ), 'assertive' );
		} else {
			debouncedSpeak( __( 'No results.' ), 'assertive' );
		}
	}

	/**
	 * Load options for an autocompleter.
	 *
	 * @param {Completer} completer The autocompleter.
	 * @param {string}    query     The query, if any.
	 */
	loadOptions( completer, query ) {
		const { options } = completer;

		/*
		 * We support both synchronous and asynchronous retrieval of completer options
		 * but internally treat all as async so we maintain a single, consistent code path.
		 *
		 * Because networks can be slow, and the internet is wonderfully unpredictable,
		 * we don't want two promises updating the state at once. This ensures that only
		 * the most recent promise will act on `optionsData`. This doesn't use the state
		 * because `setState` is batched, and so there's no guarantee that setting
		 * `activePromise` in the state would result in it actually being in `this.state`
		 * before the promise resolves and we check to see if this is the active promise or not.
		 */
		const promise = this.activePromise = Promise.resolve(
			typeof options === 'function' ? options( query ) : options
		).then( ( optionsData ) => {
			if ( promise !== this.activePromise ) {
				// Another promise has become active since this one was asked to resolve, so do nothing,
				// or else we might end triggering a race condition updating the state.
				return;
			}
			const keyedOptions = optionsData.map( ( optionData, optionIndex ) => ( {
				key: `${ completer.idx }-${ optionIndex }`,
				value: optionData,
				label: completer.getOptionLabel( optionData ),
				keywords: completer.getOptionKeywords ? completer.getOptionKeywords( optionData ) : [],
				isDisabled: completer.isOptionDisabled ? completer.isOptionDisabled( optionData ) : false,
			} ) );

			const filteredOptions = filterOptions( this.state.search, keyedOptions );
			const selectedIndex = filteredOptions.length === this.state.filteredOptions.length ? this.state.selectedIndex : 0;
			this.setState( {
				[ 'options_' + completer.idx ]: keyedOptions,
				filteredOptions,
				selectedIndex,
			} );
			this.announce( filteredOptions );
		} );
	}

	findMatch( container, cursor, allCompleters, wasOpen ) {
		const allowAnything = () => true;
		let endTextNode;
		let endIndex;
		// search backwards to find the first preceding space or non-text node.
		if ( isTextNode( cursor.node ) ) { // TEXT node
			endTextNode = cursor.node;
			endIndex = cursor.offset;
		} else if ( cursor.offset === 0 ) {
			endTextNode = onlyTextNode( descendFirst( cursor.node ) );
			endIndex = 0;
		} else {
			endTextNode = onlyTextNode( descendLast( cursor.node.childNodes[ cursor.offset - 1 ] ) );
			endIndex = endTextNode ? endTextNode.nodeValue.length : 0;
		}
		if ( endTextNode === null ) {
			return null;
		}
		// store the index of a completer in the object so we can use it to reference the options
		let completers = map( allCompleters, ( completer, idx ) => ( { ...completer, idx } ) );
		if ( wasOpen ) {
			// put the open completer at the start so it has priority
			completers = [
				wasOpen,
				...filter( completers, ( completer ) => completer.idx !== wasOpen.idx ),
			];
		}
		// filter the completers to those that could handle this node
		completers = filter( completers,
			( { allowNode = allowAnything } ) => allowNode( endTextNode, container ) );
		// exit early if nothing can handle it
		if ( completers.length === 0 ) {
			return null;
		}
		let startTextNode = endTextNode;
		let text = endTextNode.nodeValue.substring( 0, endIndex );
		let pos = lastIndexOfSpace( text );
		while ( pos === -1 ) {
			const prev = onlyTextNode( startTextNode.previousSibling );
			if ( prev === null ) {
				break;
			}
			// filter the completers to those that could handle this node
			completers = filter( completers,
				( { allowNode = allowAnything } ) => allowNode( endTextNode, container ) );
			// exit early if nothing can handle it
			if ( completers.length === 0 ) {
				return null;
			}
			startTextNode = prev;
			text = prev.nodeValue + text;
			pos = lastIndexOfSpace( prev.nodeValue );
		}
		// exit early if nothing can handle it
		if ( text.length <= pos + 1 ) {
			return null;
		}
		// find a completer that matches
		const open = find( completers, ( { triggerPrefix = '', allowContext = allowAnything } ) => {
			if ( text.substr( pos + 1, triggerPrefix.length ) !== triggerPrefix ) {
				return false;
			}
			const before = this.createRange( container, 0, startTextNode, pos + 1 );
			const after = this.createRange( endTextNode, endIndex, container, container.childNodes.length );
			return allowContext( before, after );
		} );
		// exit if no completers match
		if ( ! open ) {
			return null;
		}
		const { triggerPrefix = '' } = open;
		const range = this.createRange( startTextNode, pos + 1, endTextNode, endIndex );
		const query = text.substr( pos + 1 + triggerPrefix.length );
		return { open, range, query };
	}

	search( event ) {
		const { completers } = this.props;
		const { open: wasOpen, suppress: wasSuppress, query: wasQuery } = this.state;
		const container = event.target;

		// ensure that the cursor location is unambiguous
		const cursor = this.getCursor( container );
		if ( ! cursor ) {
			return;
		}
		// look for the trigger prefix and search query just before the cursor location
		const match = this.findMatch( container, cursor, completers, wasOpen );
		const { open, query, range } = match || {};
		// asynchronously load the options for the open completer
		if ( open && ( ! wasOpen || open.idx !== wasOpen.idx || query !== wasQuery ) ) {
			if ( open.isDebounced ) {
				this.debouncedLoadOptions( open, query );
			} else {
				this.loadOptions( open, query );
			}
		}
		// create a regular expression to filter the options
		const search = open ? new RegExp( '(?:\\b|\\s|^)' + escapeRegExp( query ), 'i' ) : /./;
		// filter the options we already have
		const filteredOptions = open ? filterOptions( search, this.state[ 'options_' + open.idx ] ) : [];
		// check if we should still suppress the popover
		const suppress = ( open && wasSuppress === open.idx ) ? wasSuppress : undefined;
		// update the state
		if ( wasOpen || open ) {
			this.setState( { selectedIndex: 0, filteredOptions, suppress, search, open, query, range } );
		}
		// announce the count of filtered options but only if they have loaded
		if ( open && this.state[ 'options_' + open.idx ] ) {
			this.announce( filteredOptions );
		}
	}

	handleKeyDown( event ) {
		const { open, suppress, selectedIndex, filteredOptions } = this.state;
		if ( ! open ) {
			return;
		}
		if ( suppress === open.idx ) {
			switch ( event.keyCode ) {
				// cancel popup suppression on CTRL+SPACE
				case SPACE:
					const { ctrlKey, shiftKey, altKey, metaKey } = event;
					if ( ctrlKey && ! ( shiftKey || altKey || metaKey ) ) {
						this.setState( { suppress: undefined } );
						event.preventDefault();
						event.stopPropagation();
					}
					break;

				// reset on cursor movement
				case UP:
				case DOWN:
				case LEFT:
				case RIGHT:
					this.reset();
			}
			return;
		}
		if ( filteredOptions.length === 0 ) {
			return;
		}
		let nextSelectedIndex;
		switch ( event.keyCode ) {
			case UP:
				nextSelectedIndex = ( selectedIndex === 0 ? filteredOptions.length : selectedIndex ) - 1;
				this.setState( { selectedIndex: nextSelectedIndex } );
				break;

			case DOWN:
				nextSelectedIndex = ( selectedIndex + 1 ) % filteredOptions.length;
				this.setState( { selectedIndex: nextSelectedIndex } );
				break;

			case ESCAPE:
				this.setState( { suppress: open.idx } );
				break;

			case ENTER:
				this.select( filteredOptions[ selectedIndex ] );
				break;

			case LEFT:
			case RIGHT:
				this.reset();
				return;

			default:
				return;
		}

		// Any handled keycode should prevent original behavior. This relies on
		// the early return in the default case.
		event.preventDefault();
		event.stopPropagation();
	}

	getWordRect() {
		const { range } = this.state;
		if ( ! range ) {
			return;
		}

		return range.getBoundingClientRect();
	}

	toggleKeyEvents( isListening ) {
		// This exists because we must capture ENTER key presses before RichText.
		// It seems that react fires the simulated capturing events after the
		// native browser event has already bubbled so we can't stopPropagation
		// and avoid RichText getting the event from TinyMCE, hence we must
		// register a native event handler.
		const handler = isListening ? 'addEventListener' : 'removeEventListener';
		this.node[ handler ]( 'keydown', this.handleKeyDown, true );
	}

	componentDidUpdate( prevProps, prevState ) {
		const { open } = this.state;
		const { open: prevOpen } = prevState;
		if ( ( ! open ) !== ( ! prevOpen ) ) {
			this.toggleKeyEvents( ! ! open );
		}
	}

	componentWillUnmount() {
		this.toggleKeyEvents( false );
		this.debouncedLoadOptions.cancel();
	}

	render() {
		const { children, instanceId } = this.props;
		const { open, suppress, selectedIndex, filteredOptions } = this.state;
		const { key: selectedKey = '' } = filteredOptions[ selectedIndex ] || {};
		const { className, idx } = open || {};
		const isExpanded = suppress !== idx && filteredOptions.length > 0;
		const listBoxId = isExpanded ? `components-autocomplete-listbox-${ instanceId }` : null;
		const activeId = isExpanded ? `components-autocomplete-item-${ instanceId }-${ selectedKey }` : null;
		// Disable reason: Clicking the editor should reset the autocomplete when the menu is suppressed
		/* eslint-disable jsx-a11y/no-static-element-interactions, jsx-a11y/onclick-has-role, jsx-a11y/click-events-have-key-events */
		return (
			<div
				ref={ this.bindNode }
				onInput={ this.search }
				onClick={ this.resetWhenSuppressed }
				className="components-autocomplete"
			>
				{ children( { isExpanded, listBoxId, activeId } ) }
				{ isExpanded && (
					<Popover
						focusOnMount={ false }
						onClose={ this.reset }
						position="top right"
						className="components-autocomplete__popover"
						getAnchorRect={ this.getWordRect }
					>
						<div
							id={ listBoxId }
							role="listbox"
							className="components-autocomplete__results"
						>
							{ isExpanded && map( filteredOptions, ( option, index ) => (
								<Button
									key={ option.key }
									id={ `components-autocomplete-item-${ instanceId }-${ option.key }` }
									role="option"
									aria-selected={ index === selectedIndex }
									disabled={ option.isDisabled }
									className={ classnames( 'components-autocomplete__result', className, {
										'is-selected': index === selectedIndex,
									} ) }
									onClick={ () => this.select( option ) }
								>
									{ option.label }
								</Button>
							) ) }
						</div>
					</Popover>
				) }
			</div>
		);
		/* eslint-enable jsx-a11y/no-static-element-interactions, jsx-a11y/onclick-has-role, jsx-a11y/click-events-have-key-events */
	}
}

export default compose( [
	withSpokenMessages,
	withInstanceId,
	withFocusOutside, // this MUST be the innermost HOC as it calls handleFocusOutside
] )( Autocomplete );
