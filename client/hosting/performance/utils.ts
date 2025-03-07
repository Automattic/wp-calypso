export function isValidURL( url: string ) {
	if ( 'canParse' in URL ) {
		return URL.canParse( url );
	}
	return /^(https?:\/\/)?((?!false\.)([a-z0-9-]+\.)+)[a-z]{2,}(:[0-9]{1,5})?(\/[^\s]*)?$/i.test(
		url
	);
}
