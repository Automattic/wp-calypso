// http://stackoverflow.com/questions/12303989/cartesian-product-of-multiple-arrays-in-javascript
const f = ( a, b ) => [].concat( ...a.map( c => b.map( d => [].concat( c, d ) ) ) );
const cartesian = ( a, b, ...c ) => b ? cartesian( f( a, b ), ...c ) : a;

/**
 * Generates variation objects based on a product's attributes.
 *
 * @param {Object} product Product object.
 * @return {Array} Array of variation objects.
 */
export default function generateVariations( product ) {
	const { attributes } = product;
	const variationTypeOptions = [];
	const variationTypeNames = [];
	const variationTypes = (
		attributes &&
		attributes.filter( attribute => attribute.variation && attribute.name && attribute.options.length > 0 )
	) || [];

	if ( variationTypes.length < 1 ) {
		return [];
	}

	variationTypes.forEach( function( variationType ) {
		variationTypeOptions.push( variationType.options );
		variationTypeNames.push( variationType.name );
	} );

	return cartesian( ...variationTypeOptions ).map( function( combination ) {
		return {
			attributes: Array.isArray( combination ) && combination.map( function( option, i ) {
				return {
					name: variationTypeNames[ i ],
					option,
				};
			} ) || [ { name: variationTypeNames[ 0 ], option: combination } ],
		};
	} );
}
