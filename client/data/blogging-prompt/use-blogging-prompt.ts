import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { requestBloggingPrompt } from 'calypso/state/blogging-prompts/actions';
import getBloggingPrompt from 'calypso/state/blogging-prompts/selectors';
import { BloggingPrompt } from 'calypso/state/blogging-prompts/types';

const useBloggingPrompt = ( siteId: string ): BloggingPrompt | null => {
	const dispatch = useDispatch();
	const { bloggingPrompt } = useSelector( ( state ) => ( {
		bloggingPrompt: getBloggingPrompt( state, Number( siteId ) ),
	} ) );

	useEffect( () => {
		if ( siteId && ! bloggingPrompt ) {
			dispatch( requestBloggingPrompt( siteId ) );
		}
	}, [ dispatch, siteId, bloggingPrompt ] );

	return bloggingPrompt;
};

export default useBloggingPrompt;
