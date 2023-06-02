/**
 * See https://github.com/you-dont-need/You-Dont-Need-Lodash-Underscore#_keyBy
 */
type Collection< T > = T[] | { [ key in PropertyKey ]: T };

type Iteratee< T, TResult > = TResult | ( ( value: T ) => TResult );

const isObject = ( value: unknown ) => value != null && typeof value === 'object';

const arrayKeyBy = < T >( array: T[], iteratee: Iteratee< T, PropertyKey > ) =>
	( array || [] ).reduce( ( result, value ) => {
		let key;
		if ( typeof iteratee === 'function' ) {
			key = iteratee( value );
		} else if ( isObject( value ) ) {
			key = ( value as any )[ iteratee ];
		} else {
			throw new Error(
				`keyBy(): ${ String( iteratee ) } can't be used to index non-object value: ${ value }`
			);
		}

		return { ...result, [ key ]: value };
	}, {} );

const collectionKeyBy = < T >(
	collection: Collection< T >,
	iteratee: Iteratee< T, PropertyKey >
): { [ key in PropertyKey ]: T } =>
	Array.isArray( collection )
		? arrayKeyBy( collection, iteratee )
		: arrayKeyBy( Object.values( collection || {} ), iteratee );

export default collectionKeyBy;
