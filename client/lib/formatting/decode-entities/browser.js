/** @format */
let element = ( () => {
	if ( document.implementation && document.implementation.createHTMLDocument ) {
		return document.implementation.createHTMLDocument( '' ).createElement( 'textarea' );
	}

	return document.createElement( 'textarea' );
} )();

export default function decodeEntities( text ) {
	element.innerHTML = text;
	let decoded = element.textContent;
	element.innerHTML = '';
	return decoded;
}
