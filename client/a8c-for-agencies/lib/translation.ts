type Item =
	| string
	| number
	| {
			props?: {
				children?: Item | Item[];
				href?: string;
			};
	  };

// Extract nested strings from a translated string
export function extractStrings( item: Item, result: string = '' ): string {
	if ( typeof item === 'string' || typeof item === 'number' ) {
		result += item;
	} else if ( item?.props ) {
		if ( Array.isArray( item.props.children ) ) {
			for ( const child of item.props.children ) {
				result = extractStrings( child, result );
			}
		} else if ( item.props.children ) {
			result = extractStrings( item.props.children, result );
		}

		if ( item.props.href ) {
			result += `: ${ item.props.href }`;
		}
	}
	return result;
}
