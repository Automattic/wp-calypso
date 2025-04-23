import type { TokensObject } from './types';

function flattenTheme( obj: TokensObject, parent?: string, res: Record< string, string > = {} ) {
	if ( Array.isArray( obj ) ) {
		return obj.reduce( ( acc, item, index ) => {
			acc[ `${ parent }-${ index + 1 }` ] = item;
			return acc;
		}, res );
	}

	for ( const key in obj ) {
		const propName = parent ? parent + '-' + key : key;
		if ( Array.isArray( obj[ key ] ) ) {
			obj[ key ].forEach( ( item, index ) => {
				res[ `${ propName }-${ index + 1 }` ] = item;
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
export const themeToCss = ( theme: TokensObject, prefix = '' ) => {
	const flattenedTheme = flattenTheme( theme );

	return Object.keys( flattenedTheme ).reduce( ( result, key ) => {
		result[ `--theme-${ prefix }${ key }` ] = flattenedTheme[ key ];
		return result;
	}, {} as React.CSSProperties );
};
