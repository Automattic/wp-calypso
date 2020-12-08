export default function doesValueExist< T >( value: T ): value is Exclude< T, null | undefined > {
	return !! value;
}
