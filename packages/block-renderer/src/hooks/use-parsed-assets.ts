import { useMemo } from 'react';

const useParsedAssets = ( html = '' ) => {
	return useMemo( () => {
		const doc = document.implementation.createHTMLDocument( '' );
		doc.body.innerHTML = html;
		return Array.from( doc.body.children );
	}, [ html ] );
};

export default useParsedAssets;
