function encapsulateString( input ) {
	return '"' + input.replace( /\\|\n|"/gm, '\\$1' ) + '"';
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
			'"Project-Id-Version: _s ' + ( options.projectName || '' ) + '"',
			'"Report-Msgid-Bugs-To: ' + ( options.projectBugsUrl || '' ) + '"',
			'"POT-Creation-Date: ' + new Date().toISOString() + '"',
			'"MIME-Version: 1.0"',
			'"Content-Type: text/plain; charset=UTF-8"',
			'"Content-Transfer-Encoding: 8bit"',
			'"PO-Revision-Date: 2014-MO-DA HO:MI+ZONE"',
			'"Last-Translator: FULL NAME <EMAIL@ADDRESS>"',
			'"Language-Team: LANGUAGE <LL@li.org>"',
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
			matchPotStr += "msgctxt " + encapsulateString( match.context ) + '\n';
		}
		matchPotStr += 'msgid ' + encapsulateString( match.single ) + '\n';
		if ( match.plural ) {
			matchPotStr += 'msgid_plural ' + encapsulateString( match.plural ) + '\n';
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
