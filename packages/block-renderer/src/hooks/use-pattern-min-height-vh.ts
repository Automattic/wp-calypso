import { useMemo } from 'react';

const usePatternMinHeightVh = ( html = '' ) => {
	return useMemo( () => {
		const minHeightVhResults = html.match( /min-height:(\d+)vh;?/ );
		const minHeightVhDeclaration = minHeightVhResults?.[ 0 ];
		const minHeightVhValue = minHeightVhResults?.[ 1 ];

		const isMinHeight100vh = minHeightVhValue === '100';

		// Remove min-height declaration except for 100vh
		const patternHtml =
			minHeightVhDeclaration && ! isMinHeight100vh
				? html.replace( minHeightVhDeclaration, '' )
				: html;

		return { isMinHeight100vh, patternHtml, minHeightVhValue };
	}, [ html ] );
};

export default usePatternMinHeightVh;
