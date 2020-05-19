/**
 * /*
 * atd.core.js - A building block to create a front-end for AtD
 * Author      : Raphael Mudge & Andrew Duthie, Automattic
 * License     : LGPL
 * Project     : http:
 * Contact     : raffi@automattic.com, andrew.duthie@automattic.com
 *
 */

/**
 * External dependencies
 */
import { translate } from 'i18n-calypso';

function AtDCore() {
	/* these are the categories of errors AtD should ignore */
	this.ignore_types = [
		'Bias Language',
		'Cliches',
		'Complex Expression',
		'Diacritical Marks',
		'Double Negatives',
		'Hidden Verbs',
		'Jargon Language',
		'Passive voice',
		'Phrases to Avoid',
		'Redundant Expression',
	];

	/* these are the phrases AtD should ignore */
	this.ignore_strings = {};

	/* Localized strings */
	// Back-compat, not used
	this.i18n = {};
}

/*
 * Setters
 */

AtDCore.prototype.setIgnoreStrings = function ( strings ) {
	const parent = this;

	if ( 'string' === typeof strings ) {
		strings = strings.split( /,\s*/g );
	}

	this.map( strings, function ( string ) {
		parent.ignore_strings[ string ] = 1;
	} );
};

AtDCore.prototype.showTypes = function ( strings ) {
	let show_types = strings.split( /,\s*/g ),
		types = {},
		ignore_types = [];

	/* set some default types that we want to make optional */

	/* grammar checker options */
	types[ 'Double Negatives' ] = 1;
	types[ 'Hidden Verbs' ] = 1;
	types[ 'Passive voice' ] = 1;
	types[ 'Bias Language' ] = 1;

	/* style checker options */
	types[ 'Cliches' ] = 1; // eslint-disable-line dot-notation
	types[ 'Complex Expression' ] = 1;
	types[ 'Diacritical Marks' ] = 1;
	types[ 'Jargon Language' ] = 1;
	types[ 'Phrases to Avoid' ] = 1;
	types[ 'Redundant Expression' ] = 1;

	this.map( show_types, function ( type ) {
		types[ type ] = undefined;
	} );

	this.map( this.ignore_types, function ( type ) {
		if ( types[ type ] !== undefined ) {
			ignore_types.push( type );
		}
	} );

	this.ignore_types = ignore_types;
};

/*
 * Error Parsing Code
 */

AtDCore.prototype.makeError = function ( error_s, tokens, type, seps ) {
	const struct = {};
	struct.type = type;
	struct.string = error_s;
	struct.tokens = tokens;

	if ( new RegExp( '\\b' + error_s + '\\b' ).test( error_s ) ) {
		struct.regexp = new RegExp(
			'(?!' + error_s + '<)\\b' + error_s.replace( /\s+/g, seps ) + '\\b'
		);
	} else if ( new RegExp( error_s + '\\b' ).test( error_s ) ) {
		struct.regexp = new RegExp( '(?!' + error_s + '<)' + error_s.replace( /\s+/g, seps ) + '\\b' );
	} else if ( new RegExp( '\\b' + error_s ).test( error_s ) ) {
		struct.regexp = new RegExp( '(?!' + error_s + '<)\\b' + error_s.replace( /\s+/g, seps ) );
	} else {
		struct.regexp = new RegExp( '(?!' + error_s + '<)' + error_s.replace( /\s+/g, seps ) );
	}

	struct.used = false; /* flag whether we've used this rule or not */

	return struct;
};

AtDCore.prototype.addToErrorStructure = function ( errors, list, type, seps ) {
	const parent = this;

	this.map( list, function ( error ) {
		const tokens = error.word.split( /\s+/ );
		const pre = error.pre;
		const first = tokens[ 0 ];

		if ( errors[ '__' + first ] === undefined ) {
			errors[ '__' + first ] = {};
			errors[ '__' + first ].pretoks = {};
			errors[ '__' + first ].defaults = [];
		}

		if ( pre === '' ) {
			errors[ '__' + first ].defaults.push(
				parent.makeError( error.word, tokens, type, seps, pre )
			);
		} else {
			if ( errors[ '__' + first ].pretoks[ '__' + pre ] === undefined ) {
				errors[ '__' + first ].pretoks[ '__' + pre ] = [];
			}

			errors[ '__' + first ].pretoks[ '__' + pre ].push(
				parent.makeError( error.word, tokens, type, seps, pre )
			);
		}
	} );
};

AtDCore.prototype.buildErrorStructure = function ( spellingList, enrichmentList, grammarList ) {
	const seps = this._getSeparators();
	const errors = {};

	this.addToErrorStructure( errors, spellingList, 'hiddenSpellError', seps );
	this.addToErrorStructure( errors, grammarList, 'hiddenGrammarError', seps );
	this.addToErrorStructure( errors, enrichmentList, 'hiddenSuggestion', seps );
	return errors;
};

AtDCore.prototype._getSeparators = function () {
	let re = '',
		i;
	const str = '"s!#$%&()*+,./:;<=>?@[\\]^_{|}';

	// Build word separator regexp
	for ( i = 0; i < str.length; i++ ) {
		re += '\\' + str.charAt( i );
	}

	return '(?:(?:[\xa0' + re + '])|(?:\\-\\-))+';
};

AtDCore.prototype.processXML = function ( responseXML ) {
	let types,
		errors,
		grammarErrors,
		spellingErrors,
		enrichment,
		i,
		errorString,
		errorType,
		errorDescription,
		errorContext,
		suggestion,
		suggestions,
		j,
		errorUrl,
		errorStruct,
		ecount;

	/* types of errors to ignore */
	types = {};

	this.map( this.ignore_types, function ( type ) {
		types[ type ] = 1;
	} );

	/* save suggestions in the editor object */
	this.suggestions = [];

	/* process through the errors */
	errors = responseXML.getElementsByTagName( 'error' );

	/* words to mark */
	grammarErrors = [];
	spellingErrors = [];
	enrichment = [];

	for ( i = 0; i < errors.length; i++ ) {
		if ( errors[ i ].getElementsByTagName( 'string' ).item( 0 ).firstChild !== null ) {
			errorString = errors[ i ].getElementsByTagName( 'string' ).item( 0 ).firstChild.data;
			errorType = errors[ i ].getElementsByTagName( 'type' ).item( 0 ).firstChild.data;
			errorDescription = errors[ i ].getElementsByTagName( 'description' ).item( 0 ).firstChild
				.data;

			if ( errors[ i ].getElementsByTagName( 'precontext' ).item( 0 ).firstChild !== null ) {
				errorContext = errors[ i ].getElementsByTagName( 'precontext' ).item( 0 ).firstChild.data;
			} else {
				errorContext = '';
			}

			/* create a hashtable with information about the error in the editor object, we will use this later
			   to populate a popup menu with information and suggestions about the error */

			if ( this.ignore_strings[ errorString ] === undefined ) {
				suggestion = {};
				suggestion.description = errorDescription;
				suggestion.suggestions = [];

				/* used to find suggestions when a highlighted error is clicked on */
				suggestion.matcher = new RegExp(
					'^' + errorString.replace( /\s+/, this._getSeparators() ) + '$'
				);

				suggestion.context = errorContext;
				suggestion.string = errorString;
				suggestion.type = errorType;

				this.suggestions.push( suggestion );

				if ( errors[ i ].getElementsByTagName( 'suggestions' ).item( 0 ) !== null ) {
					suggestions = errors[ i ]
						.getElementsByTagName( 'suggestions' )
						.item( 0 )
						.getElementsByTagName( 'option' );
					for ( j = 0; j < suggestions.length; j++ ) {
						suggestion.suggestions.push( suggestions[ j ].firstChild.data );
					}
				}

				/* setup the more info url */
				if ( errors[ i ].getElementsByTagName( 'url' ).item( 0 ) !== null ) {
					errorUrl = errors[ i ].getElementsByTagName( 'url' ).item( 0 ).firstChild.data;
					suggestion.moreinfo = errorUrl + '&theme=tinymce';
				}

				if ( types[ errorDescription ] === undefined ) {
					if ( errorType === 'suggestion' ) {
						enrichment.push( { word: errorString, pre: errorContext } );
					}

					if ( errorType === 'grammar' ) {
						grammarErrors.push( { word: errorString, pre: errorContext } );
					}
				}

				if ( errorType === 'spelling' || errorDescription === 'Homophone' ) {
					spellingErrors.push( { word: errorString, pre: errorContext } );
				}

				if ( errorDescription === 'Cliches' ) {
					suggestion.description =
						'Clichés'; /* done here for backwards compatability with current user settings */
				}

				if ( errorDescription === 'Spelling' ) {
					suggestion.description = translate( 'Spelling', {
						comment: 'Proofreading error description',
					} );
				}

				if ( errorDescription === 'Repeated Word' ) {
					suggestion.description = translate( 'Repeated Word', {
						comment: 'Proofreading error description',
					} );
				}

				if ( errorDescription === 'Did you mean...' ) {
					suggestion.description = translate( 'Did you mean…', {
						comment: 'Proofreading error description',
					} );
				}
			} // end if ignore[errorString] == undefined
		} // end if
	} // end for loop

	ecount = spellingErrors.length + grammarErrors.length + enrichment.length;

	if ( ecount > 0 ) {
		errorStruct = this.buildErrorStructure( spellingErrors, enrichment, grammarErrors );
	} else {
		errorStruct = undefined;
	}

	/* save some state in this object, for retrieving suggestions later */
	return { errors: errorStruct, count: ecount, suggestions: this.suggestions };
};

AtDCore.prototype.findSuggestion = function ( element ) {
	let text = element.innerHTML,
		context = ( this.getAttrib( element, 'pre' ) + '' ).replace( /[\\,!\\?\\."\s]/g, '' ),
		len = this.suggestions.length,
		errorDescription,
		i;

	for ( i = 0; i < len; i++ ) {
		if (
			( context === '' || context === this.suggestions[ i ].context ) &&
			this.suggestions[ i ].matcher.test( text )
		) {
			errorDescription = this.suggestions[ i ];
			break;
		}
	}
	return errorDescription;
};

/*
 * TokenIterator class
 */

function TokenIterator( tokens ) {
	this.tokens = tokens;
	this.index = 0;
	this.count = 0;
	this.last = 0;
}

TokenIterator.prototype.next = function () {
	let current = this.tokens[ this.index ];
	this.count = this.last;
	this.last += current.length + 1;
	this.index++;

	/* strip single quotes from token, AtD does this when presenting errors */
	if ( current !== '' ) {
		if ( current[ 0 ] === "'" ) {
			current = current.substring( 1, current.length );
		}

		if ( current[ current.length - 1 ] === "'" ) {
			current = current.substring( 0, current.length - 1 );
		}
	}

	return current;
};

TokenIterator.prototype.hasNext = function () {
	return this.index < this.tokens.length;
};

TokenIterator.prototype.hasNextN = function ( n ) {
	return this.index + n < this.tokens.length;
};

TokenIterator.prototype.skip = function ( m, n ) {
	this.index += m;
	this.last += n;

	if ( this.index < this.tokens.length ) {
		this.count = this.last - this.tokens[ this.index ].length;
	}
};

TokenIterator.prototype.getCount = function () {
	return this.count;
};

TokenIterator.prototype.peek = function ( n ) {
	let peepers = [],
		end = this.index + n,
		x;

	for ( x = this.index; x < end; x++ ) {
		peepers.push( this.tokens[ x ] );
	}
	return peepers;
};

/*
 *  code to manage highlighting of errors
 */
AtDCore.prototype.markMyWords = function ( container_nodes, errors ) {
	let seps = new RegExp( this._getSeparators() ),
		nl = [],
		ecount = 0 /* track number of highlighted errors */,
		parent = this,
		bogus = this._isTinyMCE ? ' data-mce-bogus="1"' : '',
		emptySpan = '<span class="mceItemHidden"' + bogus + '>&nbsp;</span>',
		textOnlyMode,
		iterator;

	/**
	 * Split a text node into an ordered list of siblings:
	 * - text node to the left of the match
	 * - the element replacing the match
	 * - text node to the right of the match
	 *
	 * We have to leave the text to the left and right of the match alone
	 * in order to prevent XSS
	 *
	 * @returns array
	 */

	function splitTextNode( textnode, regexp, replacement ) {
		let text = textnode.nodeValue,
			index = text.search( regexp ),
			match = text.match( regexp ),
			captured = [],
			cursor;

		if ( index < 0 || ! match.length ) {
			return [ textnode ];
		}

		if ( index > 0 ) {
			// capture left text node
			captured.push( document.createTextNode( text.substr( 0, index ) ) );
		}

		// capture the replacement of the matched string
		captured.push( parent.create( match[ 0 ].replace( regexp, replacement ) ) );

		cursor = index + match[ 0 ].length;

		if ( cursor < text.length ) {
			// capture right text node
			captured.push( document.createTextNode( text.substr( cursor ) ) );
		}

		return captured;
	}

	/* Collect all text nodes */
	/* Our goal--ignore nodes that are already wrapped */

	this._walk( container_nodes, function ( n ) {
		if ( n.nodeType === 3 && ! parent.isMarkedNode( n ) ) {
			nl.push( n );
		}
	} );

	/* walk through the relevant nodes */

	this.map( nl, function ( n ) {
		let foundStrings = {},
			v,
			tokens,
			previous,
			doReplaces,
			token,
			current,
			defaults,
			done,
			prev,
			curr,
			newNode,
			x,
			regexp,
			result,
			i,
			contents,
			y,
			nnode;

		if ( n.nodeType === 3 ) {
			v = n.nodeValue; /* we don't want to mangle the HTML so use the actual encoded string */
			tokens = n.nodeValue.split(
				seps
			); /* split on the unencoded string so we get access to quotes as " */
			previous = '';

			doReplaces = [];

			iterator = new TokenIterator( tokens );

			while ( iterator.hasNext() ) {
				token = iterator.next();
				current = errors[ '__' + token ];

				if ( current !== undefined && current.pretoks !== undefined ) {
					defaults = current.defaults;
					current = current.pretoks[ '__' + previous ];

					done = false;
					prev = v.substr( 0, iterator.getCount() );
					curr = v.substr( prev.length, v.length );

					function checkErrors( error ) {
						if (
							error !== undefined &&
							! error.used &&
							foundStrings[ '__' + error.string ] === undefined &&
							error.regexp.test( curr )
						) {
							foundStrings[ '__' + error.string ] = 1;
							doReplaces.push( [
								error.regexp,
								'<span class="' + error.type + '" pre="' + previous + '"' + bogus + '>$&</span>',
							] );

							error.used = true;
							done = true;
						}
					}

					if ( current !== undefined ) {
						previous = previous + ' ';
						parent.map( current, checkErrors );
					}

					if ( ! done ) {
						previous = '';
						parent.map( defaults, checkErrors );
					}
				}

				previous = token;
			} // end while

			/* do the actual replacements on this span */
			if ( doReplaces.length > 0 ) {
				newNode = n;

				for ( x = 0; x < doReplaces.length; x++ ) {
					regexp = doReplaces[ x ][ 0 ];
					result = doReplaces[ x ][ 1 ];

					/* it's assumed that this function is only being called on text nodes (nodeType == 3), the iterating is necessary
					   because eventually the whole thing gets wrapped in an mceItemHidden span and from there it's necessary to
					   handle each node individually. */
					function bringTheHurt( node ) {
						let span, splitNodes;

						if ( node.nodeType === 3 ) {
							ecount++;

							/* sometimes IE likes to ignore the space between two spans, solution is to insert a placeholder span with
							   a non-breaking space.  The markup removal code substitutes this span for a space later */
							if (
								parent.isIE() &&
								node.nodeValue.length > 0 &&
								node.nodeValue.substr( 0, 1 ) === ' '
							) {
								return parent.create(
									emptySpan +
										node.nodeValue.substr( 1, node.nodeValue.length - 1 ).replace( regexp, result ),
									false
								);
							}

							if ( textOnlyMode ) {
								return parent.create( node.nodeValue.replace( regexp, result ), false );
							}

							span = parent.create( '<span />' );
							if ( typeof textOnlyMode === 'undefined' ) {
								// cache this to avoid adding / removing nodes unnecessarily
								textOnlyMode = typeof span.appendChild !== 'function';
								if ( textOnlyMode ) {
									parent.remove( span );
									return parent.create( node.nodeValue.replace( regexp, result ), false );
								}
							}

							// "Visual" mode
							splitNodes = splitTextNode( node, regexp, result );
							for ( i = 0; i < splitNodes.length; i++ ) {
								span.appendChild( splitNodes[ i ] );
							}

							node = span;
							return node;
						}

						contents = parent.contents( node );

						for ( y = 0; y < contents.length; y++ ) {
							if ( contents[ y ].nodeType === 3 && regexp.test( contents[ y ].nodeValue ) ) {
								if (
									parent.isIE() &&
									contents[ y ].nodeValue.length > 0 &&
									contents[ y ].nodeValue.substr( 0, 1 ) === ' '
								) {
									nnode = parent.create(
										emptySpan +
											contents[ y ].nodeValue
												.substr( 1, contents[ y ].nodeValue.length - 1 )
												.replace( regexp, result ),
										true
									);
								} else {
									nnode = parent.create( contents[ y ].nodeValue.replace( regexp, result ), true );
								}

								parent.replaceWith( contents[ y ], nnode );
								parent.removeParent( nnode );

								ecount++;

								return node; /* we did a replacement so we can call it quits, errors only get used once */
							}
						}

						return node;
					} // jshint ignore:line

					newNode = bringTheHurt( newNode );
				}

				parent.replaceWith( n, newNode );
			}
		}
	} );

	return ecount;
};

AtDCore.prototype._walk = function ( elements, f ) {
	let i;
	for ( i = 0; i < elements.length; i++ ) {
		f.call( f, elements[ i ] );
		this._walk( this.contents( elements[ i ] ), f );
	}
};

AtDCore.prototype.removeWords = function ( node, w ) {
	let count = 0;
	const parent = this;

	this.map( this.findSpans( node ).reverse(), function ( n ) {
		let nnode;
		if (
			n &&
			( parent.isMarkedNode( n ) ||
				parent.hasClass( n, 'mceItemHidden' ) ||
				parent.isEmptySpan( n ) )
		) {
			if ( n.innerHTML === '&nbsp;' ) {
				nnode = document.createTextNode( ' ' ); /* hax0r */
				parent.replaceWith( n, nnode );
			} else if ( ! w || n.innerHTML === w ) {
				parent.removeParent( n );
				count++;
			}
		}
	} );

	return count;
};

AtDCore.prototype.isEmptySpan = function ( node ) {
	return (
		this.getAttrib( node, 'class' ) === '' &&
		this.getAttrib( node, 'style' ) === '' &&
		this.getAttrib( node, 'id' ) === '' &&
		! this.hasClass( node, 'Apple-style-span' ) &&
		this.getAttrib( node, 'mce_name' ) === ''
	);
};

AtDCore.prototype.isMarkedNode = function ( node ) {
	return (
		this.hasClass( node, 'hiddenGrammarError' ) ||
		this.hasClass( node, 'hiddenSpellError' ) ||
		this.hasClass( node, 'hiddenSuggestion' )
	);
};

/*
 * Context Menu Helpers
 */
AtDCore.prototype.applySuggestion = function ( element, suggestion ) {
	let node;
	if ( suggestion === '(omit)' ) {
		this.remove( element );
	} else {
		node = this.create( suggestion );
		this.replaceWith( element, node );
		this.removeParent( node );
	}
};

/*
 * Check for an error
 */
AtDCore.prototype.hasErrorMessage = function ( xmlr ) {
	return xmlr !== undefined && xmlr.getElementsByTagName( 'message' ).item( 0 ) !== null;
};

AtDCore.prototype.getErrorMessage = function ( xmlr ) {
	return xmlr.getElementsByTagName( 'message' ).item( 0 );
};

/* this should always be an error, alas... not practical */
AtDCore.prototype.isIE = function () {
	return navigator.appName === 'Microsoft Internet Explorer';
};

export default AtDCore;
