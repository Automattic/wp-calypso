let _decodeTextArea;

export function decodeEntities( html ) {
	// not a string, or no entities to decode
	if ( 'string' !== typeof html || -1 === html.indexOf( '&' ) ) {
		return html;
	}

	// create a textarea for decoding entities, that we can reuse
	if ( undefined === _decodeTextArea ) {
		if ( document.implementation && document.implementation.createHTMLDocument ) {
			_decodeTextArea = document.implementation.createHTMLDocument( '' ).createElement( 'textarea' );
		} else {
			_decodeTextArea = document.createElement( 'textarea' );
		}
	}

	_decodeTextArea.innerHTML = html;
	const decoded = _decodeTextArea.textContent;
	_decodeTextArea.innerHTML = '';
	return decoded;
}
