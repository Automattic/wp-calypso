/**
 * Builds an object keyed by running each value of a collection through an
 * iteratee (a function, or a property name read from each object value). On a
 * key collision the later value wins.
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
