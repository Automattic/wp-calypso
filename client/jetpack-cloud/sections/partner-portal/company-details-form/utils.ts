export function castAsString( value: any ): string {
	if ( value === null || typeof value === 'undefined' ) {
		return '';
	}

	return String( value );
}
