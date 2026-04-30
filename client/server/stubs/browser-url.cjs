function fileURLToPath( value ) {
	const url = value instanceof URL ? value : new URL( value );
	return decodeURIComponent( url.pathname );
}

function pathToFileURL( value ) {
	const url = new URL( 'file://' );
	url.pathname = value;
	return url;
}

module.exports = {
	fileURLToPath,
	pathToFileURL,
};
