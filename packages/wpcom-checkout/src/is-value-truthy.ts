export function isValueTruthy< T >( value: T ): value is Exclude< T, null | undefined | false > {
	return !! value;
}
