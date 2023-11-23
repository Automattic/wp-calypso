import { useMemo } from 'react';

const usePatternMinHeightVh = ( html = '', viewportHeight: number | undefined = 0 ) => {
	return useMemo( () => {
		return html.replace( /min-height:\s?(?<value>\d+)vh;?/g, ( match, value ) => {
			if ( viewportHeight ) {
				// Replace with the percentage of viewport height in pixels.
				return `min-height:${ ( Number( value ) * viewportHeight ) / 100 }px;`;
			}

			return match;
		} );
	}, [ html, viewportHeight ] );
};

export default usePatternMinHeightVh;
