export default ( value ) => {
	if ( '' === value ) {
		return 0;
	}
	const float = Number.parseFloat( value );
	return isNaN( float ) ? value : float;
};
