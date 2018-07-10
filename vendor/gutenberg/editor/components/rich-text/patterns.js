/**
 * External dependencies
 */
import tinymce from 'tinymce';
import { filter, escapeRegExp, groupBy, drop } from 'lodash';

/**
 * WordPress dependencies
 */
import { ESCAPE, ENTER, SPACE, BACKSPACE } from '@wordpress/keycodes';
import { getBlockTransforms, findTransform } from '@wordpress/blocks';

export default function( editor ) {
	const getContent = this.getContent.bind( this );
	const { setTimeout, onReplace } = this.props;

	const VK = tinymce.util.VK;
	const settings = editor.settings.wptextpattern || {};

	const {
		enter: enterPatterns,
		undefined: spacePatterns,
	} = groupBy( filter( getBlockTransforms( 'from' ), { type: 'pattern' } ), 'trigger' );

	const inlinePatterns = settings.inline || [
		{ delimiter: '`', format: 'code' },
	];

	let canUndo;

	editor.on( 'selectionchange', function() {
		canUndo = null;
	} );

	editor.on( 'keydown', function( event ) {
		const { keyCode } = event;

		if ( ( canUndo && keyCode === ESCAPE ) || ( canUndo === 'space' && keyCode === BACKSPACE ) ) {
			editor.undoManager.undo();
			event.preventDefault();
			event.stopImmediatePropagation();
		}

		if ( VK.metaKeyPressed( event ) ) {
			return;
		}

		if ( keyCode === ENTER ) {
			enter( event );
		// Wait for the browser to insert the character.
		} else if ( keyCode === SPACE ) {
			setTimeout( () => searchFirstText( spacePatterns ) );
		} else if ( keyCode > 47 && ! ( keyCode >= 91 && keyCode <= 93 ) ) {
			setTimeout( inline );
		}
	}, true );

	function inline() {
		const range = editor.selection.getRng();
		const node = range.startContainer;
		const carretOffset = range.startOffset;

		// We need a non empty text node with an offset greater than zero.
		if ( ! node || node.nodeType !== 3 || ! node.data.length || ! carretOffset ) {
			return;
		}

		const textBeforeCaret = node.data.slice( 0, carretOffset );
		const charBeforeCaret = node.data.charAt( carretOffset - 1 );

		const { start, pattern } = inlinePatterns.reduce( ( acc, item ) => {
			if ( acc.result ) {
				return acc;
			}

			if ( charBeforeCaret !== item.delimiter.slice( -1 ) ) {
				return acc;
			}

			const escapedDelimiter = escapeRegExp( item.delimiter );
			const regExp = new RegExp( '(.*)' + escapedDelimiter + '.+' + escapedDelimiter + '$' );
			const match = textBeforeCaret.match( regExp );

			if ( ! match ) {
				return acc;
			}

			const startOffset = match[ 1 ].length;
			const endOffset = carretOffset - item.delimiter.length;
			const before = textBeforeCaret.charAt( startOffset - 1 );
			const after = textBeforeCaret.charAt( startOffset + item.delimiter.length );
			const delimiterFirstChar = item.delimiter.charAt( 0 );

			// test*test* => format applied
			// test *test* => applied
			// test* test* => not applied
			if ( startOffset && /\S/.test( before ) ) {
				if ( /\s/.test( after ) || before === delimiterFirstChar ) {
					return acc;
				}
			}

			const contentRegEx = new RegExp( '^[\\s' + escapeRegExp( delimiterFirstChar ) + ']+$' );
			const content = textBeforeCaret.slice( startOffset, endOffset );

			// Do not replace when only whitespace and delimiter characters.
			if ( contentRegEx.test( content ) ) {
				return acc;
			}

			return {
				start: startOffset,
				pattern: item,
			};
		}, {} );

		if ( ! pattern ) {
			return;
		}

		const { delimiter, format } = pattern;
		const formats = editor.formatter.get( format );

		if ( ! formats || ! formats[ 0 ].inline ) {
			return;
		}

		editor.undoManager.add();
		editor.undoManager.transact( () => {
			node.insertData( carretOffset, '\uFEFF' );

			const newNode = node.splitText( start );
			const zero = newNode.splitText( carretOffset - start );

			newNode.deleteData( 0, delimiter.length );
			newNode.deleteData( newNode.data.length - delimiter.length, delimiter.length );

			editor.formatter.apply( format, {}, newNode );
			editor.selection.setCursorLocation( zero, 1 );

			// We need to wait for native events to be triggered.
			setTimeout( () => {
				canUndo = 'space';

				editor.once( 'selectionchange', () => {
					if ( zero ) {
						const zeroOffset = zero.data.indexOf( '\uFEFF' );

						if ( zeroOffset !== -1 ) {
							zero.deleteData( zeroOffset, zeroOffset + 1 );
						}
					}
				} );
			} );
		} );
	}

	function searchFirstText( patterns ) {
		if ( ! onReplace ) {
			return;
		}

		// Merge text nodes.
		editor.getBody().normalize();

		const content = getContent();

		if ( ! content.length ) {
			return;
		}

		const firstText = content[ 0 ];

		const transformation = findTransform( patterns, ( item ) => {
			return item.regExp.test( firstText );
		} );

		if ( ! transformation ) {
			return;
		}

		const result = firstText.match( transformation.regExp );

		const range = editor.selection.getRng();
		const matchLength = result[ 0 ].length;
		const remainingText = firstText.slice( matchLength );

		// The caret position must be at the end of the match.
		if ( range.startOffset !== matchLength ) {
			return;
		}

		const block = transformation.transform( {
			content: [ remainingText, ...drop( content ) ],
			match: result,
		} );

		onReplace( [ block ] );
	}

	function enter( event ) {
		if ( ! onReplace ) {
			return;
		}

		// Merge text nodes.
		editor.getBody().normalize();

		const content = getContent();

		if ( ! content.length ) {
			return;
		}

		const pattern = findTransform( enterPatterns, ( { regExp } ) => regExp.test( content[ 0 ] ) );

		if ( ! pattern ) {
			return;
		}

		const block = pattern.transform( { content } );
		onReplace( [ block ] );

		// We call preventDefault to prevent additional newlines.
		event.preventDefault();
		// stopImmediatePropagation is called to prevent TinyMCE's own processing of keydown which conflicts with the block replacement.
		event.stopImmediatePropagation();
	}
}
