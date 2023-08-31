import { useMemo } from 'react';

const usePatternMinHeightVh = ( html = '', viewportHeight: number | undefined = 0 ) => {
	return useMemo( () => {
		return html.replace( /min-height:\s?(?<value>\d+)vh;?/g, ( match, value ) => {
			if ( viewportHeight ) {
				// In the large preview, replace with the percentage of viewport height in pixels.
				return `min-height:${ ( Number( value ) * viewportHeight ) / 100 }px;`;
			} else if ( value !== '100' ) {
				// In the small pattern previews, remove the min-height declaration except for 100vh
				return '';
			}
			return match;
		} );
	}, [ html, viewportHeight ] );
};

export default usePatternMinHeightVh;
