import { shuffle } from '@automattic/js-utils';
import { useMemo } from 'react';
import { MAX_BLOG_POSTS } from '../constants';

// Using this object to memoize the pattern as a workaround
const memoPatternOrder: { [ key: string ]: string } = {};

const usePatternInlineCss = ( patternId: string ) => {
	// FIXME: Why this useMemo is not working?
	return useMemo( () => {
		let inlineCss = memoPatternOrder[ patternId ] || '';

		if ( inlineCss ) {
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
