import { shuffle } from '@automattic/js-utils';
import { useMemo } from 'react';
import { MAX_BLOG_POSTS } from '../constants';

// Memoize the order per pattern to show the same order in previews
const memoPatternOrder: { [ key: string ]: string } = {};

const usePatternInlineCss = ( patternId: string, isNewSite: boolean ) => {
	return useMemo( () => {
		let inlineCss = memoPatternOrder[ patternId ] || '';

		// Only newly created sites use this css
		if ( ! isNewSite || inlineCss ) {
			return inlineCss;
		}

		shuffle( [ ...Array( MAX_BLOG_POSTS ).keys() ] ).forEach( ( order, index ) => {
			const childIndex = index + 1;
			const shuffledOrder = order + 1;
			inlineCss += `.is-layout-grid .wp-block-post:nth-child(${ childIndex }) { order: ${ shuffledOrder }; }`;
		} );

		memoPatternOrder[ patternId ] = inlineCss;

		return inlineCss;
	}, [ patternId ] );
};

export default usePatternInlineCss;
