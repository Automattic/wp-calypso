import { webFrame, remote } from 'electron'

const spellchecker = remote.require( 'spellchecker' );

export default function init() {
	webFrame.setSpellCheckProvider( 'en-US', true, {
		spellCheck: function( text ) {
			return ! spellchecker.isMisspelled( text );
		}
	} )
}
