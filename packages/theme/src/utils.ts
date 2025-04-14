import type { generateColors } from './color';

// flattens the theme object to a single level
interface RecursiveObj {
	[ key: string ]: RecursiveObj | string | string[];
}
function flattenTheme( obj: RecursiveObj, parent?: string, res: Record< string, string > = {} ) {
	if ( Array.isArray( obj ) ) {
		return obj.reduce( ( acc, item, index ) => {
			acc[ `${ parent }-${ index }` ] = item;
			return acc;
		}, res );
	}

	for ( const key in obj ) {
		const propName = parent ? parent + '-' + key : key;
		if ( Array.isArray( obj[ key ] ) ) {
			obj[ key ].forEach( ( item, index ) => {
				res[ `${ propName }-${ index }` ] = item;
			} );
		} else if ( typeof obj[ key ] === 'object' ) {
			flattenTheme( obj[ key ], propName, res );
		} else {
			res[ propName.replace( '-default', '' ) ] = obj[ key ];
		}
	}
	return res;
}

// converts a theme object to a CSS object containing CSS variables
export const themeToCss = (
	theme: { color: ReturnType< typeof generateColors > },
	prefix = ''
) => {
	const flattenedTheme = flattenTheme( theme );

	return Object.keys( flattenedTheme ).reduce( ( result, key ) => {
		result[ `--theme-${ prefix }${ key }` ] = flattenedTheme[ key ];
		return result;
	}, {} as React.CSSProperties );
};
