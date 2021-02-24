function isNullish( value: any ): boolean {
	if ( typeof value === 'undefined' ) {
		return true;
	}

	if ( value === null ) {
		return true;
	}

	return false;
}

export default isNullish;
