function isNullish( value: any ): value is null | undefined {
	if ( typeof value === 'undefined' ) {
		return true;
	}

	if ( value === null ) {
		return true;
	}

	return false;
}

export default isNullish;
