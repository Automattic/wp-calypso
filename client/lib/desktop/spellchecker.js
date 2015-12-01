import { webFrame, remote } from 'electron'

const spellchecker = remote.require( 'spellchecker' );

export default function init( locale ) {
	webFrame.setSpellCheckProvider( locale, true, {
		spellCheck: function( text ) {
			return ! spellchecker.isMisspelled( text );
		}
	} )
}
