export function capitalPDangit( input ) {
	if ( 'string' !== typeof input ) {
		throw new Error( 'capitalPDangit expects a string as input' );
	}
	return input.replace( /Wordpress/g, 'WordPress' );
}
