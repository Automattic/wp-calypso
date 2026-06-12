import type { ReactNode } from 'react';

type ItemProps = {
	children?: ReactNode;
	href?: string;
};

// Extract nested strings from a translated string
export function extractStrings( item: ReactNode, result: string = '' ): string {
	if ( typeof item === 'string' || typeof item === 'number' ) {
		result += item;
	} else if ( item && typeof item === 'object' && 'props' in item && item.props ) {
		const props = item.props as ItemProps;
		if ( Array.isArray( props.children ) ) {
			for ( const child of props.children ) {
				result = extractStrings( child, result );
			}
		} else if ( props.children ) {
			result = extractStrings( props.children, result );
		}

		if ( props.href ) {
			result += `: ${ props.href }`;
		}
	}
	return result;
}
