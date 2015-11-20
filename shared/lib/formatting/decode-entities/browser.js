module.exports = function( text ) {
	var textarea = document.createElement( 'textarea' );
	textarea.innerHTML = text;
	return textarea.textContent;
};
