const MAX_COLUMNS = 79,
	SEPARATORS = [ ' ' , '/' , ',' , ';' ];

/**
 * Split a string literal into multiple lines
 * Ex:
 * input: '"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."'
 * output:
 * '""
 * "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod "
 * "tempor incididunt ut labore et dolore magna aliqua."
 *
 * @param literal {string}     - A string literal
 * @param startAt {string|int} - A prefix (or the negative length of the prefix) the literal will be printed at
 * @returns {string}           - A multiline string compatible with the POT format
 */
function multiline( literal, startAt ) {
	var nextSpaceIndex, i, char,
		maxPosition = MAX_COLUMNS - 1; // MAX_COLUMNS minus the last character needed for closing string (a ");

	if ( typeof startAt === 'string' ) {
		startAt = - startAt.length;
	} else if ( startAt === undefined ) {
		startAt = - 6;
	}

	if ( literal.length <= startAt + MAX_COLUMNS ) {
		return literal.substr( startAt > 0 ? startAt : 0 );
	}

	if ( startAt < 0 ) {
		return '""\n' + multiline( literal, 0 );
	}

	for ( i = startAt + maxPosition - 1; i > startAt; i-- ) {
		char = literal.charAt( i );
		if ( SEPARATORS.indexOf( char ) !== -1 ) {
			nextSpaceIndex = i;
			break;
		}
	}

	// we encountered a very long word, look to the right
	if ( ! nextSpaceIndex ) {
		for ( i = startAt + maxPosition; i < literal.length - 1; i++ ) {
			char = literal.charAt( i );
			if ( SEPARATORS.indexOf( char ) !== -1 ) {
				nextSpaceIndex = i;
				break;
			}
		}
	}

	return literal.substring( startAt, nextSpaceIndex + 1 ) + '"\n' + multiline( '"' + literal.substr( nextSpaceIndex + 1 ), 0 );
}

function uniqueMatchId( match ) {
	return ( match.plural ? 'p' : 's' ) +
		' msgid=' + ( match.plural || match.single ) +
		' ctxt=' + ( match.context || '' );
}

// Reference for the PO format: http://www.gnu.org/software/gettext/manual/gettext.html#PO-Files
// More details: http://pology.nedohodnik.net/doc/user/en_US/ch-poformat.html
module.exports = function( matches, options ) {
	var uniqueMatchesMap = {},
		output;

	// default match for the header
	uniqueMatchesMap[ uniqueMatchId( { single: '' } ) ] = true;

	output = "# THIS IS A GENERATED FILE. DO NOT EDIT DIRECTLY.\n";

	if( options.copyrightNotice ) {
		if ( Array.isArray( options.copyrightNotice ) ) {
			output += '# ' + options.copyrightNotice.join( '\n#' );
		} else {
			output += '# ' + options.copyrightNotice;
		}
		output += '\n';
	}

	output += '\n';

	output += options.potHeader || [
			'msgid ""',
			'msgstr ""',
			'"Project-Id-Version: _s ' + ( options.projectName || '' ) + '\\n"',
			'"Report-Msgid-Bugs-To: ' + ( options.projectBugsUrl || '' ) + '\\n"',
			'"POT-Creation-Date: ' + new Date().toISOString() + '\\n"',
			'"MIME-Version: 1.0\\n"',
			'"Content-Type: text/plain; charset=UTF-8\\n"',
			'"Content-Transfer-Encoding: 8bit\\n"',
			'"PO-Revision-Date: 2014-MO-DA HO:MI+ZONE\\n"',
			'"Last-Translator: FULL NAME <EMAIL@ADDRESS>\\n"',
			'"Language-Team: LANGUAGE <LL@li.org>\\n"',
			''
		].join( '\n' );

	output += '\n';

	output += matches.map( function( match ) {
		var matchPotStr = "",
			matchId = uniqueMatchId( match );

		if ( uniqueMatchesMap[ matchId ] ) {
			return undefined;
		} else {
			uniqueMatchesMap[ matchId ] = true;
		}

		if ( match.comment ) {
			matchPotStr += match.comment.split( '\n' ).map( function( commentLine ) {
				return '#. ' + commentLine + '\n';
			} ).join( '' );
		}
		if ( match.context ) {
			matchPotStr += 'msgctxt ' + multiline( match.context, 'msgctxt ' ) + '\n';
		}
		matchPotStr += 'msgid ' + multiline( match.single, 'msgid ' ) + '\n';
		if ( match.plural ) {
			matchPotStr += 'msgid_plural ' + multiline( match.plural, 'msgid_plural ' ) + '\n';
			matchPotStr += 'msgstr[0] ""\n';
			matchPotStr += 'msgstr[1] ""\n';
		} else {
			matchPotStr += 'msgstr ""\n';
		}
		return matchPotStr;
	} ).filter( function( match ) { // removes undefined
		return match;
	} ).join( '\n' );

	return output;
};
