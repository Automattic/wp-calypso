/** Turns an A2UI enum value, such as `smallFeature`, into a BEM modifier, such as `small-feature`. */
export function kebabCase( value: string ) {
	return value.replace( /[A-Z]/g, ( letter ) => `-${ letter.toLowerCase() }` );
}
