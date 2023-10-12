export default function trimDomain( value: string ) {
	if ( ! value ) {
		return '';
	}
	const decodedValue = decodeURIComponent( value );
	return decodedValue.replace( /\s/g, '' );
}
