export function validateURL( url: string ) {
	return /^(https?:\/\/)?([a-z0-9-]+\.)+[a-z]{2,}(:[0-9]{1,5})?(\/[^\s]*)?$/i.test( url );
}

export function areURLsUnique( urls: string[] ) {
	const urlSet = new Set( urls );
	return urlSet.size === urls.length;
}
