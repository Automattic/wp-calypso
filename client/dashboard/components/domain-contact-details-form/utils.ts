export function sanitizePhoneCountryCode( phoneCountryCode: string ): string {
	return phoneCountryCode ? '+' + phoneCountryCode.replace( /[^0-9]/g, '' ) : '';
}

export function sanitizePhoneNumber( phoneNumber: string ): string {
	return phoneNumber.replace( /[^0-9]/g, '' );
}

export function splitPhoneNumber( phoneNumber: string ): string[] {
	const firstDotIndex = phoneNumber.indexOf( '.' );
	if ( firstDotIndex === -1 ) {
		return [ '', '' ];
	}
	return [
		sanitizePhoneCountryCode( phoneNumber.substring( 0, firstDotIndex ) ),
		sanitizePhoneNumber( phoneNumber.substring( firstDotIndex + 1 ) ),
	];
}

export function combinePhoneNumber( countryNumericCode: string, phoneNumber: string ): string {
	return `${ countryNumericCode }.${ phoneNumber }`;
}
